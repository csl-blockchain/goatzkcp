import json
import hashlib
import time

# --- OBJEK SIMULASI ---

class TransactionProof:
    """Mewakili bukti validitas sebuah transaksi."""
    def __init__(self, tx_id, protocol, proof_content, verification_method, is_valid):
        self.tx_id = tx_id
        self.protocol = protocol
        self.proof_content = proof_content
        self.verification_method = verification_method
        self.is_valid = is_valid

    def to_dict(self):
        return {
            "transaction_id": self.tx_id,
            "protocol": self.protocol,
            "proof_of_validity": self.proof_content,
            "verification_method": self.verification_method,
            "is_objectively_valid": self.is_valid
        }

class MaliciousBuyer:
    """Mewakili pembeli jahat yang akan membuat klaim palsu."""
    def make_false_claim(self, transaction_proof: TransactionProof):
        print(f"[MALICIOUS BUYER] Klaim: 'Transaksi {transaction_proof.tx_id} tidak valid!'")
        # Dalam skenario ZKCP, klaim ini sulit dibantah.
        # Dalam skenario GoatZKCP, klaim ini bisa langsung dibantah.
        return f"Klaim palsu dibuat untuk transaksi {transaction_proof.tx_id}."

# --- STRUKTUR DATA UTAMA UNTUK HASIL JSON ---
hasil_simulasi = {
    "nama_simulasi": "Reputation Attack Simulation",
    "skenario_zkcp": {},
    "skenario_goatzkcp": {}
}

# ==============================================================================
# SKENARIO 1: SERANGAN PADA ZKCP TRADISIONAL
# ==============================================================================

# Simulasi transaksi ZKCP yang valid
tx_id_zkcp = hashlib.sha256(str(time.time()).encode()).hexdigest()[:16]
zkcp_proof = TransactionProof(
    tx_id=tx_id_zkcp,
    protocol="ZKCP",
    proof_content="[Private Data] Buyer secara pribadi memverifikasi ZK-proof dan menganggapnya valid.",
    verification_method="Verifikasi privat oleh pembeli",
    is_valid=True # Transaksi ini sebenarnya valid
)

# Pembeli jahat membuat klaim palsu
buyer_zkcp = MaliciousBuyer()
false_claim_zkcp = buyer_zkcp.make_false_claim(zkcp_proof)

# Menyimpan hasil
hasil_simulasi["skenario_zkcp"] = {
    "deskripsi": "Simulasi di mana pembeli jahat membuat klaim palsu setelah transaksi valid.",
    "bukti_yang_tersedia": {
        "sifat_bukti": "Subjektif",
        "keterangan": "Hanya pembeli yang tahu hasil verifikasi. Tidak ada catatan publik yang bisa membantah klaim palsu."
    },
    "dampak_klaim_palsu": {
        "status_sengketa": "Ambigius (Tidak Terselesaikan)",
        "analisis": "Reputasi penjual dapat rusak karena tidak ada cara objektif untuk membuktikan kebenaran."
    },
    "kesimpulan": {
        "status_serangan": "BERHASIL",
        "alasan": "Verifikasi yang bersifat privat dan tidak adanya bukti on-chain menciptakan celah untuk manipulasi reputasi."
    }
}

# ==============================================================================
# SKENARIO 2: PERTAHANAN PADA GOATZKCP
# ==============================================================================

# Simulasi transaksi GoatZKCP yang valid
tx_id_goatzkcp = "0x" + hashlib.sha256(str(time.time() + 1).encode()).hexdigest()[:64]
goatzkcp_proof = TransactionProof(
    tx_id=tx_id_goatzkcp,
    protocol="GoatZKCP",
    proof_content=f"Hash Transaksi Sukses: {tx_id_goatzkcp}",
    verification_method="Verifikasi publik oleh Smart Contract",
    is_valid=True # Transaksi ini divalidasi oleh smart contract
)

# Pembeli jahat membuat klaim palsu
buyer_goatzkcp = MaliciousBuyer()
false_claim_goatzkcp = buyer_goatzkcp.make_false_claim(goatzkcp_proof)

# Menyimpan hasil
hasil_simulasi["skenario_goatzkcp"] = {
    "deskripsi": "Simulasi klaim palsu yang sama pada GoatZKCP.",
    "bukti_yang_tersedia": {
        "sifat_bukti": "Objektif & Tidak Terbantahkan (Irrefutable)",
        "keterangan": f"Keberhasilan transaksi tercatat secara permanen di blockchain dengan hash: {tx_id_goatzkcp}. Siapapun bisa memverifikasinya."
    },
    "dampak_klaim_palsu": {
        "status_sengketa": "Terselesaikan (Klaim Terbantahkan)",
        "analisis": "Penjual dapat dengan mudah membantah klaim palsu dengan menunjukkan bukti transaksi on-chain. Reputasi penjual aman."
    },
    "kesimpulan": {
        "status_serangan": "GAGAL",
        "alasan": "Verifikasi on-chain oleh smart contract menghilangkan subjektivitas dan menciptakan catatan publik yang dapat diaudit."
    }
}


# --- TULIS HASIL KE FILE json ---
nama_file_output = "reputation_attack_results.json"
with open(nama_file_output, "w") as f:
    json.dump(hasil_simulasi, f, indent=4)

print(f"✅ Simulasi Reputation Attack selesai. Hasil telah disimpan ke dalam file: {nama_file_output}")