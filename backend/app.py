from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from ultralytics import YOLO
from datetime import datetime, timedelta
import psycopg2
from psycopg2 import sql
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from config import DATABASE, SECRET_KEY
from functools import wraps
import json
from werkzeug.utils import secure_filename

# Initialize OBB model
model_path = os.path.join(os.path.dirname(__file__), 'model', 'best.pt')
model = YOLO(model_path)

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = SECRET_KEY # ubah kalau sudah masuk production

# Storage directories
UPLOAD_FOLDER = 'uploads'
ANNOTATED_FOLDER = os.path.join(UPLOAD_FOLDER, 'annotated')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ANNOTATED_FOLDER, exist_ok=True)

# Disease information dictionary (unchanged)
DISEASE_INFO = {
    "Scabies": {
        "penjelasan": "Infeksi tungau Sarcoptes scabiei yang menyebabkan gatal parah, Kerak kuning keabu-abuan dan rambut rontok terutama di telinga wajah dan siku.",
        "solusi": "Obat topical: Selamectin (Revolution) atau ivermectin, Mandi dengan shampo antiseborheik, Pembersihan lingkungan kandang secara menyeluruh, Isolasi sementara dari hewan lain."
    },
    "Ringworm": {
        "penjelasan": "Infeksi jamur Microsporum canis yang menyebabkan lesi melingkar, kulit bersisik, Rambut patah/rontok, Sangat menular ke manusia dan hewan lain.",
        "solusi": "Salep antijamur (miconazole/clotrimazole), Gunakan sarung tangan saat menangani kucing."
    },
    "Hairloss": {
        "penjelasan": "Kerontokan rambut abnormal yang bisa disebabkan oleh stres, Alergi, gangguan hormonal (hipertiroid), Adanya parasit.",
        "solusi": "Identifikasi penyebab utama (cek thyroid dan tes alergi), Suplemen omega-3 untuk kesehatan kulit."
    }
}

# Database connection helper
def get_db_connection():
    return psycopg2.connect(
        host=DATABASE['host'],
        database=DATABASE['database'],
        user=DATABASE['user'],
        password=DATABASE['password'],
        port=DATABASE['port']
    )

# Authentication middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = data['user_id']

            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                return jsonify({'error': 'Invalid token'}), 401
            
        except Exception as e:
            return jsonify({'error': 'Invalid token: ' + str(e)}), 401
        finally:
            cursor.close()
            conn.close()
        
        # Pass user_id to the route via kwargs
        return f(user_id=user_id, *args, **kwargs)
    return decorated


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    
    if not email or not password or not username:
        return jsonify({'error': 'Email, password, dan username diperlukan'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'error': 'Email sudah terdaftar'}), 400
        
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING id",
            (username, email, hashed_password)
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Registrasi berhasil',
            'token': token,
            'user_id': user_id
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email dan password diperlukan'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, password FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user[2], password):
            return jsonify({'error': 'Email atau password salah'}), 401
        
        token = jwt.encode({
            'user_id': user[0],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login berhasil',
            'token': token,
            'user_id': user[0],
            'username': user[1]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/users', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400
    
    email = data['email']
    
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM users WHERE email = %s", (email,))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"message": "User not found"}), 404
        
        return jsonify({"message": "User deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/save_history_db', methods=['POST'])
@token_required
def save_history_endpoint(user_id):
    data = request.json
    filename = data.get('filename')  # Sesuaikan dengan key dari frontend
    disease_details = data.get('disease_details')
    detected_classes = data.get('detected_classes', [])  # Kalau ada
    save_history_db(user_id, filename, detected_classes, disease_details)
    return jsonify({"message": "History saved"}), 201

# Helper functions for history DB operations
# @app.route('/save_history_db', methods=['POST', 'OPTIONS'])
# @token_required
def save_history_db(user_id, filename, detected_classes, disease_details):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO history (user_id, filename, upload_time, detected_classes, disease_details)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                user_id,
                filename,
                datetime.now(),
                detected_classes, 
                json.dumps(disease_details)  
            )
        )
        conn.commit()
    except Exception as e:
        print(f"❌ Gagal menyimpan history ke DB: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def get_history_db(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT filename, upload_time, detected_classes, disease_details
            FROM history
            WHERE user_id = %s
            ORDER BY upload_time DESC
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
        history = []
        for row in rows:
            history.append({
                'filename': row[0],
                'upload_time': row[1].strftime("%Y-%m-%d %H:%M:%S"),
                'detected_classes': (row[2]),
                'disease_details': (row[3])
            })
        return history
    except Exception as e:
        print(f"❌ Gagal mengambil history dari DB: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def delete_history_db(user_id, filename):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM history WHERE user_id = %s AND filename = %s",
            (user_id, filename)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"❌ Gagal menghapus history dari DB: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


@app.route('/upload', methods=['POST'])
@token_required
def upload_image(user_id):
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(filepath)

    if not os.path.exists(filepath):
        return jsonify({'error': 'Saved file not found'}), 500

    try:
        results = model.predict(source=filepath, save=False)
        if not results or len(results) == 0:
            return jsonify({'error': 'No detection results'}), 500

        detected_classes = []
        disease_details = []

        annotated_filename = f"annotated_{image.filename}"
        annotated_path = os.path.join(ANNOTATED_FOLDER, annotated_filename)

        for result in results:
            result.save(filename=annotated_path)

            if result.obb is not None and len(result.obb) > 0:
                for obb in result.obb:
                    class_id = int(obb.cls[0].item())
                    class_name = model.names.get(class_id, "Unknown")
                    if class_name not in detected_classes:
                        detected_classes.append(class_name)
                        info = DISEASE_INFO.get(class_name, {"penjelasan": "Tidak diketahui", "solusi": "Belum ada rekomendasi"})
                        disease_details.append({
                            "name": class_name,
                            "penjelasan": info["penjelasan"],
                            "solusi": info["solusi"]
                        })
            else:
                print("⚠️ Tidak ada OBB yang terdeteksi pada result ini.")

        # Save to DB
        # save_history_db(user_id, f'annotated/{annotated_filename}', detected_classes, disease_details)

        return jsonify({
            'message': 'Image uploaded and detected successfully',
            'filename': f'annotated/{annotated_filename}',
            'detected_classes': detected_classes,
            'disease_details': disease_details
        })

    except Exception as e:
        print("❌ Error saat deteksi:", e)
        return jsonify({'error': 'Detection failed', 'detail': str(e)}), 500

# Public upload (no auth, history not saved)
@app.route('/public-upload', methods=['POST'])
def public_upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    filename = secure_filename(image.filename)
    if filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    image.save(filepath)

    if not os.path.exists(filepath):
        return jsonify({'error': 'Saved file not found'}), 500

    try:
        results = model.predict(source=filepath, save=False)
        if not results or len(results) == 0:
            return jsonify({'error': 'No detection results'}), 500

        detected_classes = []
        disease_details = []

        annotated_filename = f"public_annotated_{image.filename}"
        annotated_path = os.path.join(ANNOTATED_FOLDER, annotated_filename)

        for result in results:
            result.save(filename=annotated_path)

            if result.obb is not None and len(result.obb) > 0:
                for obb in result.obb:
                    class_id = int(obb.cls[0].item())
                    class_name = model.names.get(class_id, "Unknown")
                    if class_name not in detected_classes:
                        detected_classes.append(class_name)
                        info = DISEASE_INFO.get(class_name, {"penjelasan": "Tidak diketahui", "solusi": "Belum ada rekomendasi"})
                        disease_details.append({
                            "name": class_name,
                            "penjelasan": info["penjelasan"],
                            "solusi": info["solusi"]
                        })

        return jsonify({
            'message': 'Image detected successfully (public)',
            'filename': f'annotated/{annotated_filename}',
            'detected_classes': detected_classes,
            'disease_details': disease_details
        })

    except Exception as e:
        return jsonify({'error': 'Detection failed', 'detail': str(e)}), 500


@app.route('/history', methods=['GET'])
@token_required
def get_history(user_id):
    history = get_history_db(user_id)
    return jsonify(history)

# Delete history entry by filename
@app.route('/history/<filename>', methods=['DELETE'])
@token_required
def delete_history(user_id, filename):
    try:
        # Remove annotated file from disk
        annotated_file_path = os.path.join(ANNOTATED_FOLDER, filename)
        if os.path.exists(annotated_file_path):
            os.remove(annotated_file_path)

        deleted = delete_history_db(user_id, f'annotated/{filename}')
        if not deleted:
            return jsonify({'message': 'Riwayat tidak ditemukan atau bukan milik user'}), 404
        
        return jsonify({'message': 'Riwayat berhasil dihapus'}), 200
    except Exception as e:
        print(f"❌ Gagal menghapus history: {e}")
        return jsonify({'error': str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/uploads/annotated/<filename>')
def get_annotated_image(filename):
    return send_from_directory(ANNOTATED_FOLDER, filename)

# if __name__ == '__main__':
#     app.run(debug=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

