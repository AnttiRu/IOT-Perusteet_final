# Työmaan Olosuhde-Anturi - Raspberry Pi Pico
# Rakennustyömaan alipaineen ja ilmanlaadun valvonta
# 
# Sensorit:
# - Referenssi: DHT22 (lämpötila, kosteus) + BMP280 (paine) - PUH            
            # Lue osastojen paineet
            room1_pressure = pressure_room1.read_pressure()
            room2_pressure = pressure_room2.read_pressure()
            room3_pressure = pressure_room3.read_pressure()
            
            pressures = {
                "Osasto_1": room1_pressure,
                "Osasto_2": room2_pressure,
                "Osasto_3": room3_pressure
# - Paine 1: BMP280 - Osasto 1
# - Paine 2: BMP280 - Osasto 2  
# - Paine 3: BMP280 - Osasto 3
# - PM2.5/PM10: Simuloitu pienhiukkassensori (analoginen)

import machine
import time
import dht
import json
import random
from machine import Pin, I2C, ADC

# Konfiguraatio
API_URL = "http://localhost:3000/api/measurements"
DEVICE_ID = "tyomaa_pico_01"

# Hälytysrajat (Pascal, suhteessa referenssiin)
# HUOM: Alipaineistuksessa negatiivisempi = parempi!
# -30 Pa tai pienempi = HYVÄ (vahva alipaine)
# -10 Pa = VAROITUS (heikko alipaine)  
# 0 Pa tai suurempi = KRIITTINEN (ei alipainetta!)
PRESSURE_DIFF_GOOD = -30.0      # Pa (hyvä alipaine, ei hälytystä)
PRESSURE_DIFF_WARNING = -10.0   # Pa (heikko alipaine, seuranta)
PRESSURE_DIFF_CRITICAL = 0.0    # Pa (EI alipainetta - HÄLYTYS!)
PM25_WARNING = 35.0             # µg/m³
PM25_CRITICAL = 55.0            # µg/m³
PM10_WARNING = 50.0             # µg/m³
PM10_CRITICAL = 150.0           # µg/m³

# LED-hälytykset
led_green = Pin(15, Pin.OUT)    # Normaali tila
led_yellow = Pin(14, Pin.OUT)   # Varoitus
led_red = Pin(13, Pin.OUT)      # Kriittinen

# DHT22 - Referenssipiste (lämpötila + kosteus)
dht_sensor = dht.DHT22(Pin(2))

# Simuloidaan BMP280 paineantureita (todellisessa käyttäisiin I2C)
# Raspberry Pi Pico: I2C0 = Pin 0 (SDA), Pin 1 (SCL)
# I2C1 = Pin 6 (SDA), Pin 7 (SCL)

class BMP280Simulator:
    """Simuloi BMP280 paineanturin käyttäytymistä"""
    def __init__(self, name, base_pressure=101325):
        self.name = name
        self.base_pressure = base_pressure
        self.offset = random.uniform(-50, 50)  # Satunnainen offset
    
    def read_pressure(self):
        """Simuloi paineen lukemista (Pascal)"""
        # Lisää pientä vaihtelua
        variation = random.uniform(-5, 5)
        return self.base_pressure + self.offset + variation
    
    def read_temperature(self):
        """Simuloi lämpötilan lukemista (Celsius)"""
        return 20.0 + random.uniform(-2, 2)

# Luo paineanturisimulaa ttorit
# Paineanturit (simuloitu - tosielämässä I2C)
pressure_reference = BMP280Simulator("Referenssi", 101325)      # Puhdas puoli
pressure_room1 = BMP280Simulator("Osasto_1", 101295)            # Kevyt alipaine
pressure_room2 = BMP280Simulator("Osasto_2", 101280)            # Keskivahva alipaine  
pressure_room3 = BMP280Simulator("Osasto_3", 101250)            # Vahva alipaine

# PM2.5/PM10 pienhiukkassensori (simuloitu analogisella pinnillä)
pm_sensor = ADC(Pin(26))  # ADC0

def read_pm_sensor():
    """Simuloi PM2.5 ja PM10 lukemia analogisesta sensorista"""
    raw_value = pm_sensor.read_u16()
    # Skaalaa 0-65535 -> 0-200 µg/m³
    pm25 = (raw_value / 65535) * 100 + random.uniform(0, 30)
    pm10 = pm25 * 1.5 + random.uniform(0, 20)  # PM10 yleensä korkeampi
    return pm25, pm10

def read_dht22():
    """Lue lämpötila ja kosteus DHT22:sta"""
    try:
        dht_sensor.measure()
        temp = dht_sensor.temperature()
        humid = dht_sensor.humidity()
        return temp, humid
    except Exception as e:
        print(f"DHT22 virhe: {e}")
        return None, None

def calculate_pressure_differences(ref_pressure, room_pressures):
    """Laske paineerot referenssiin nähden"""
    differences = {}
    for room_name, room_pressure in room_pressures.items():
        diff = room_pressure - ref_pressure
        differences[room_name] = diff
    return differences

def check_alerts(pressure_diffs, pm25, pm10):
    """Tarkista hälytysrajat ja palauta hälytystaso
    
    Alipainelogiikka:
    - diff >= 0 Pa: KRIITTINEN (ei alipainetta!)
    - diff >= -10 Pa: VAROITUS (heikko alipaine)
    - diff < -30 Pa: HYVÄ (vahva alipaine, ei hälytystä)
    """
    alert_level = "normal"
    alerts = []
    
    # Tarkista paineerot (negatiivisempi = parempi!)
    for room, diff in pressure_diffs.items():
        if diff >= PRESSURE_DIFF_CRITICAL:  # >= 0 Pa
            alert_level = "critical"
            alerts.append(f"{room}: KRIITTINEN - Ei alipainetta! {diff:.1f} Pa")
        elif diff >= PRESSURE_DIFF_WARNING:  # >= -10 Pa
            if alert_level != "critical":
                alert_level = "warning"
            alerts.append(f"{room}: Varoitus - Heikko alipaine {diff:.1f} Pa")
    
    # Tarkista pienhiukkaset
    if pm25 >= PM25_CRITICAL or pm10 >= PM10_CRITICAL:
        alert_level = "critical"
        alerts.append(f"Kriittinen pölypitoisuus: PM2.5={pm25:.1f}, PM10={pm10:.1f}")
    elif pm25 >= PM25_WARNING or pm10 >= PM10_WARNING:
        if alert_level != "critical":
            alert_level = "warning"
        alerts.append(f"Kohonnut pölypitoisuus: PM2.5={pm25:.1f}, PM10={pm10:.1f}")
    
    return alert_level, alerts

def update_leds(alert_level):
    """Päivitä LED-indikaattorit hälytystason mukaan"""
    if alert_level == "critical":
        led_green.off()
        led_yellow.off()
        led_red.on()
    elif alert_level == "warning":
        led_green.off()
        led_yellow.on()
        led_red.off()
    else:
        led_green.on()
        led_yellow.off()
        led_red.off()

def send_data_to_api(data):
    """Lähetä data API:lle (simuloitu)"""
    try:
        # Todellisessa toteutuksessa käytettäisiin urequests-kirjastoa
        # import urequests
        # response = urequests.post(API_URL, json=data)
        print(f"[API] Lähetetään data: {json.dumps(data)}")
        return True
    except Exception as e:
        print(f"[API] Virhe: {e}")
        return False

def main():
    """Pääohjelmasilmukka"""
    print("=" * 60)
    print("TYÖMAAN OLOSUHDE-ANTURI - Raspberry Pi Pico")
    print("Alipaineen ja ilmanlaadun valvonta")
    print("=" * 60)
    print()
    
    measurement_count = 0
    
    while True:
        try:
            measurement_count += 1
            print(f"\n--- Mittaus #{measurement_count} ---")
            
            # Lue referenssipiste (puhdas puoli)
            temp, humid = read_dht22()
            ref_pressure = pressure_ref.read_pressure()
            
            if temp is None:
                print("DHT22 lukuvirhe, odotetaan...")
                time.sleep(2)
                continue
            
            # Lue työhuoneiden paineet
            room1_pressure = pressure_room1.read_pressure()
            room2_pressure = pressure_room2.read_pressure()
            room3_pressure = pressure_room3.read_pressure()
            
            room_pressures = {
                "Työhuone_1": room1_pressure,
                "Työhuone_2": room2_pressure,
                "Työhuone_3": room3_pressure
            }
            
            # Laske paineerot
            pressure_diffs = calculate_pressure_differences(ref_pressure, room_pressures)
            
            # Lue pienhiukkaspitoisuudet
            pm25, pm10 = read_pm_sensor()
            
            # Tarkista hälytykset
            alert_level, alerts = check_alerts(pressure_diffs, pm25, pm10)
            
            # Päivitä LEDit
            update_leds(alert_level)
            
            # Tulosta mittaustulokset
            print(f"Referenssi (Puhdas puoli):")
            print(f"  Lämpötila: {temp:.1f}°C")
            print(f"  Kosteus: {humid:.1f}%")
            print(f"  Paine: {ref_pressure:.1f} Pa ({ref_pressure/100:.2f} hPa)")
            print()
            
            print(f"Paineerot (suhteessa referenssiin):")
            for room, diff in pressure_diffs.items():
                status = "✓ OK" if diff > PRESSURE_DIFF_WARNING else ("⚠ VAROITUS" if diff > PRESSURE_DIFF_CRITICAL else "🚨 KRIITTINEN")
                print(f"  {room}: {diff:+.1f} Pa {status}")
            print()
            
            print(f"Pienhiukkaset:")
            print(f"  PM2.5: {pm25:.1f} µg/m³")
            print(f"  PM10: {pm10:.1f} µg/m³")
            print()
            
            if alerts:
                print(f"HÄLYTYKSET ({alert_level.upper()}):")
                for alert in alerts:
                    print(f"  - {alert}")
            else:
                print("✓ Kaikki arvot normaalilla alueella")
            
            # Valmistele data API:lle
            data = {
                "device_id": DEVICE_ID,
                "timestamp": time.time(),
                "reference": {
                    "temperature": temp,
                    "humidity": humid,
                    "pressure": ref_pressure
                },
                "rooms": {
                    "room1": {"pressure": room1_pressure, "diff": pressure_diffs["Osasto_1"]},
                    "room2": {"pressure": room2_pressure, "diff": pressure_diffs["Osasto_2"]},
                    "room3": {"pressure": room3_pressure, "diff": pressure_diffs["Osasto_3"]}
                },
                "air_quality": {
                    "pm25": pm25,
                    "pm10": pm10
                },
                "alert_level": alert_level,
                "alerts": alerts
            }
            
            # Lähetä data
            send_data_to_api(data)
            
            # Odota 10 sekuntia ennen seuraavaa mittausta
            time.sleep(10)
            
        except KeyboardInterrupt:
            print("\n\nOhjelma pysäytetty")
            led_green.off()
            led_yellow.off()
            led_red.off()
            break
        except Exception as e:
            print(f"Virhe pääsilmukassa: {e}")
            time.sleep(2)

# Käynnistä ohjelma
if __name__ == "__main__":
    main()