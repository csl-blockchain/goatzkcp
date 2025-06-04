import time
import json
import random

# --- OBJEK SIMULASI ---

class Seller:
    """Mewakili penjual dalam simulasi."""
    def __init__(self, protocol_name):
        self.protocol = protocol_name
        self.resources_wasted_time = 0.0

    def generate_proof(self, payment_locked=False):
        """
        Fungsi inti yang mensimulasikan pembuatan ZK-proof yang mahal.
        Pada GoatZKCP, fungsi ini hanya akan berjalan jika pembayaran sudah terkunci.
        """
        if self.protocol == "GoatZKCP" and not payment_locked:
            # Di GoatZKCP, penjual tidak akan bekerja sebelum dana terkunci
            return "[GUARD] Pembayaran belum terkunci. Pembuatan proof dibatalkan."

        # Simulasi proses komputasi yang mahal
        start_time = time.perf_counter()
        # Waktu komputasi dibuat random antara 1.2 hingga 1.6 detik
        simulated_work_time = random.uniform(1.2, 1.6)
        time.sleep(simulated_work_time)
        end_time = time.perf_counter()

        wasted_time = end_time - start_time
        self.resources_wasted_time += wasted_time
        return f"Proof berhasil dibuat dalam {wasted_time:.2f} detik."

class Attacker:
    """Mewakili penyerang yang mencoba melakukan DoS."""
    def __init__(self):
        self.cost = 0.0

    def launch_attack(self, seller: Seller):
        """Melancarkan satu kali serangan."""
        if seller.protocol == "ZKCP":
            # Pada ZKCP, penyerang bisa langsung meminta proof tanpa biaya.
            seller.generate_proof()
            # Biaya penyerang 0
            self.cost = 0
            return "Serangan pada ZKCP: Meminta proof tanpa membayar."
        
        elif seller.protocol == "GoatZKCP":
            # Pada GoatZKCP, penyerang harus mencoba mengunci dana, yang butuh biaya gas.
            # Kita asumsikan serangan berhenti di sini (tidak benar-benar mengunci dana).
            # Jika penyerang benar-benar mengunci dana, itu menjadi transaksi sah.
            simulated_gas_fee = 0.005 # Biaya gas simulasi dalam ETH
            self.cost = simulated_gas_fee
            seller.generate_proof(payment_locked=False) # Mencoba meminta proof tanpa dana terkunci
            return "Serangan pada GoatZKCP: Mencoba meminta proof, tapi terblokir oleh mekanisme penguncian dana."

# --- STRUKTUR DATA UTAMA UNTUK HASIL JSON ---
hasil_simulasi = {
    "nama_simulasi": "Denial of Service (DoS) Attack Simulation",
    "skenario_zkcp": {},
    "skenario_goatzkcp": {}
}


# ==============================================================================
# SKENARIO 1: SERANGAN PADA ZKCP
# ==============================================================================
seller_zkcp = Seller(protocol_name="ZKCP")
attacker_for_zkcp = Attacker()

# Penyerang melancarkan 1 kali serangan
attacker_for_zkcp.launch_attack(seller_zkcp)

# Menyimpan hasil
hasil_simulasi["skenario_zkcp"] = {
    "deskripsi": "Simulasi DoS di mana penyerang meminta proof tanpa komitmen pembayaran.",
    "biaya_penyerang": {
        "nilai": attacker_for_zkcp.cost,
        "satuan": "ETH (simulasi)",
        "analisis": "Penyerang tidak mengeluarkan biaya apa pun untuk melancarkan serangan."
    },
    "dampak_pada_penjual": {
        "waktu_komputasi_terbuang_detik": round(seller_zkcp.resources_wasted_time, 2),
        "analisis": "Penjual membuang waktu dan sumber daya komputasi yang signifikan tanpa kompensasi."
    },
    "kesimpulan": {
        "status_serangan": "BERHASIL",
        "alasan": "Tidak ada mekanisme yang mewajibkan komitmen finansial dari pembeli sebelum penjual melakukan pekerjaan komputasi mahal."
    }
}


# ==============================================================================
# SKENARIO 2: PERTAHANAN PADA GOATZKCP
# ==============================================================================
seller_goatzkcp = Seller(protocol_name="GoatZKCP")
attacker_for_goatzkcp = Attacker()

# Penyerang melancarkan 1 kali serangan
attacker_for_goatzkcp.launch_attack(seller_goatzkcp)

# Menyimpan hasil
hasil_simulasi["skenario_goatzkcp"] = {
    "deskripsi": "Simulasi DoS pada GoatZKCP dengan mekanisme fund-locking prerequisite.",
    "biaya_penyerang": {
        "nilai": attacker_for_goatzkcp.cost,
        "satuan": "ETH (biaya gas simulasi)",
        "analisis": "Penyerang harus mengeluarkan biaya untuk mencoba memulai serangan. Tanpa komitmen finansial, serangan tidak bisa dilanjutkan."
    },
    "dampak_pada_penjual": {
        "waktu_komputasi_terbuang_detik": round(seller_goatzkcp.resources_wasted_time, 2),
        "analisis": "Penjual tidak melakukan komputasi apa pun karena dana belum terkunci. Sumber daya penjual aman."
    },
    "kesimpulan": {
        "status_serangan": "GAGAL",
        "alasan": "Mekanisme fund-locking prerequisite bertindak sebagai gerbang finansial, membuat serangan menjadi tidak praktis atau berubah menjadi transaksi yang sah."
    }
}

# --- TULIS HASIL KE FILE json ---
nama_file_output = "dos_attack_results.json"
with open(nama_file_output, "w") as f:
    json.dump(hasil_simulasi, f, indent=4)

print(f"✅ Simulasi DoS selesai. Hasil telah disimpan ke dalam file: {nama_file_output}")