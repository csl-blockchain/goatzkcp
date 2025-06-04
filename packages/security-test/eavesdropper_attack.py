import os
import json
from cryptography.fernet import Fernet

# --- FUNGSI-FUNGSI PEMBANTU UNTUK ENKRIPSI & DEKRIPSI ---

def generate_key():
    """Menghasilkan kunci enkripsi baru yang valid."""
    return Fernet.generate_key()

def encrypt(data: bytes, key: bytes) -> bytes:
    """Menenkripsi data menggunakan kunci yang diberikan."""
    f = Fernet(key)
    return f.encrypt(data)

def decrypt(token: bytes, key: bytes) -> bytes:
    """Mendekripsi token menggunakan kunci yang diberikan."""
    try:
        f = Fernet(key)
        return f.decrypt(token)
    except Exception:
        return b"[DECRYPTION FAILED] Kunci salah atau token tidak valid."

# --- STRUKTUR DATA UTAMA UNTUK HASIL JSON ---
hasil_simulasi = {
    "nama_simulasi": "Eavesdropper Attack Simulation",
    "skenario_zkcp": {},
    "skenario_goatzkcp": {}
}

# --- DATA & AKTOR SIMULASI ---
DATA_RAHASIA = b"1 3 1 4 2"
PUBLIC_MEMPOOL = {}

# ==============================================================================
# SKENARIO 1: SERANGAN PADA ZKCP TRADISIONAL
# ==============================================================================

# Persiapan data
k_zkcp = generate_key()
ciphertext_zkcp = encrypt(DATA_RAHASIA, k_zkcp)
PUBLIC_MEMPOOL['zkcp_revealed_key'] = k_zkcp

# Simulasi penyadapan
eavesdropped_ciphertext_zkcp = ciphertext_zkcp
eavesdropped_key_zkcp = PUBLIC_MEMPOOL['zkcp_revealed_key']

# Upaya dekripsi oleh penyerang
decrypted_by_eavesdropper_zkcp = decrypt(
    eavesdropped_ciphertext_zkcp,
    eavesdropped_key_zkcp
)

# Menyimpan semua hasil ke dalam dictionary
hasil_simulasi["skenario_zkcp"] = {
    "deskripsi": "Simulasi serangan pada ZKCP di jaringan publik.",
    "kunci_asli": k_zkcp.decode('utf-8'),
    "data_yang_disadap": {
        "ciphertext": eavesdropped_ciphertext_zkcp.decode('utf-8'),
        "kunci_plaintext": eavesdropped_key_zkcp.decode('utf-8')
    },
    "hasil_dekripsi_penyerang": decrypted_by_eavesdropper_zkcp.decode('utf-8'),
    "kesimpulan": {
        "status_serangan": "BERHASIL",
        "analisis": "Serangan berhasil karena kunci dekripsi dipublikasikan dalam bentuk plaintext, memungkinkan rekonstruksi data rahasia."
    }
}

# ==============================================================================
# SKENARIO 2: PERTAHANAN PADA GOATZKCP
# ==============================================================================

# Persiapan data
k_goat_inner_secret = generate_key()
k_goat_outer_public = generate_key()
k_seismic_infra_key = generate_key()

inner_ciphertext = encrypt(DATA_RAHASIA, k_goat_inner_secret)
outer_ciphertext_goat = encrypt(inner_ciphertext, k_goat_outer_public)

encrypted_k_in_mempool = encrypt(k_goat_outer_public, k_seismic_infra_key)
PUBLIC_MEMPOOL['goat_revealed_key'] = encrypted_k_in_mempool

# Simulasi penyadapan
eavesdropped_double_encrypted_ciphertext = outer_ciphertext_goat
eavesdropped_encrypted_key = PUBLIC_MEMPOOL['goat_revealed_key']

# Upaya dekripsi oleh penyerang
final_decrypted_data = decrypt(
    eavesdropped_double_encrypted_ciphertext,
    eavesdropped_encrypted_key
)

# Menyimpan semua hasil ke dalam dictionary
hasil_simulasi["skenario_goatzkcp"] = {
    "deskripsi": "Simulasi serangan pada GoatZKCP dengan pertahanan berlapis.",
    "kunci_yang_terlibat": {
        "kunci_inner_rahasia_k_prime": k_goat_inner_secret.decode('utf-8') + " (Tidak Pernah Publik)",
        "kunci_outer_publik_k": k_goat_outer_public.decode('utf-8'),
        # <<< PERBAIKAN TYPO DI SINI >>>
        "kunci_infrastruktur_seismic": k_seismic_infra_key.decode('utf-8') + " (Tidak Pernah Publik)"
    },
    "data_yang_disadap": {
        "ciphertext_ganda": eavesdropped_double_encrypted_ciphertext.decode('utf-8'),
        "kunci_k_terenkripsi": eavesdropped_encrypted_key.decode('utf-8')
    },
    "hasil_dekripsi_penyerang": final_decrypted_data.decode('utf-8'),
    "kesimpulan": {
        "status_serangan": "GAGAL",
        "analisis": "Serangan gagal total karena kunci 'k' dienkripsi oleh platform, dan data dilindungi oleh kunci rahasia 'k'' yang tidak pernah terekspos."
    }
}


# --- TULIS HASIL KE FILE out.json ---

nama_file_output = "eavesdropper_attack_results.json"

with open(nama_file_output, "w") as file_json:
    json.dump(hasil_simulasi, file_json, indent=4)

print(f"✅ Simulasi selesai. Hasil telah disimpan ke dalam file: {nama_file_output}")