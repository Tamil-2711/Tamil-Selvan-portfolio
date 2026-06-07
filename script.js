// =============================================
// PROJECT DATA
// =============================================

const projectsData = {
    1: {
        title: "Smart Animal Repellent System Using Adaptive Frequency Feedback",
        tech: ["YOLOv8", "Python", "OpenCV", "ESP32", "Ultrasonic Transducers", "Embedded C", "IoT"],
        code: `
// Smart Animal Repellent System - Main Controller Code
#include <Arduino.h>
#include <WiFi.h>
#include <MQTT.h>

#define ULTRASONIC_PIN 13
#define CAMERA_PIN 12
#define RELAY_PIN 14

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* mqtt_server = "mqtt.broker.com";

WiFiClient wifiClient;
MQTTClient client;

struct AnimalData {
    String species;
    int frequency;
    int intensity;
};

void setup() {
    Serial.begin(115200);
    pinMode(ULTRASONIC_PIN, OUTPUT);
    pinMode(RELAY_PIN, OUTPUT);
    
    WiFi.begin(ssid, password);
    connectMQTT();
    
    Serial.println("Smart Animal Repellent System Initialized");
}

void triggerAdaptiveFrequency(AnimalData animal) {
    int pwmValue = map(animal.frequency, 20, 60, 100, 255);
    analogWrite(ULTRASONIC_PIN, pwmValue);
    
    digitalWrite(RELAY_PIN, HIGH);
    delay(animal.intensity * 100);
    digitalWrite(RELAY_PIN, LOW);
    
    Serial.println("Frequency: " + String(animal.frequency) + " kHz");
}

void connectMQTT() {
    client.begin(mqtt_server, wifiClient);
    while (!client.connect("ESP32-AnimalRepellent")) {
        delay(100);
    }
    client.subscribe("animal/detection");
}

void loop() {
    if (!client.connected()) {
        connectMQTT();
    }
    client.loop();
}
        `
    },
    2: {
        title: "Automated Attendance System Using Face Recognition",
        tech: ["Python", "OpenCV", "Machine Learning", "Raspberry Pi", "Embedded Systems", "Real-time Monitoring"],
        code: `
# Automated Attendance System - Face Recognition Module
import cv2
import numpy as np
from datetime import datetime
import face_recognition
import csv
from pathlib import Path

class AttendanceSystem:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.attendance_log = "attendance.csv"
        self.load_known_faces()
    
    def load_known_faces(self):
        """Load reference face encodings from database"""
        face_dir = Path("./known_faces")
        for person_dir in face_dir.iterdir():
            if person_dir.is_dir():
                for image_path in person_dir.glob("*.jpg"):
                    image = face_recognition.load_image_file(str(image_path))
                    encoding = face_recognition.face_encodings(image)[0]
                    self.known_face_encodings.append(encoding)
                    self.known_face_names.append(person_dir.name)
    
    def mark_attendance(self, name):
        """Mark attendance in CSV file"""
        with open(self.attendance_log, 'a', newline='') as f:
            writer = csv.writer(f)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([name, timestamp])
    
    def recognize_faces(self, frame):
        """Detect and recognize faces in frame"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        
        for face_encoding, face_location in zip(face_encodings, face_locations):
            matches = face_recognition.compare_faces(
                self.known_face_encodings, face_encoding
            )
            distances = face_recognition.face_distance(
                self.known_face_encodings, face_encoding
            )
            
            best_match_index = np.argmin(distances)
            if matches[best_match_index]:
                name = self.known_face_names[best_match_index]
                self.mark_attendance(name)
                return name, face_location
        
        return "Unknown", None

def main():
    system = AttendanceSystem()
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        name, location = system.recognize_faces(frame)
        
        if location:
            y1, x2, y2, x1 = location
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, name, (x1, y1-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        cv2.imshow('Attendance System', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
        `
    },
    3: {
        title: "Multi-Functional Drone",
        tech: ["Flight Controller", "Arduino", "Embedded C", "Sensor Interfacing", "Robotics", "System Integration"],
        code: `
// Multi-Functional Drone Controller - Flight Management
#include <Arduino.h>
#include <I2Cdev.h>
#include <MPU6050.h>
#include <Servo.h>

// Motor pins
#define MOTOR_FL 3
#define MOTOR_FR 5
#define MOTOR_BL 6
#define MOTOR_BR 9

// Sensor pins
#define BARO_SDA 20
#define BARO_SCL 21

MPU6050 mpu;
Servo motors[4];

struct DroneState {
    float pitch, roll, yaw;
    float altitide;
    float vx, vy, vz;
    bool armed;
};

DroneState droneState = {0, 0, 0, 0, 0, 0, 0, false};

void setup() {
    Serial.begin(115200);
    
    // Initialize sensors
    Wire.begin(BARO_SDA, BARO_SCL);
    mpu.initialize();
    
    // Initialize motors
    for(int i = 0; i < 4; i++) {
        motors[i].attach(i);
        motors[i].writeMicroseconds(1000); // Disarm
    }
    
    Serial.println("Drone initialized");
}

void updateIMU() {
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    
    // Convert to angles (simplified)
    droneState.pitch = atan2(ay, az) * 57.2958;
    droneState.roll = atan2(ax, az) * 57.2958;
}

void stabilizeAttitude() {
    float pidOutput[3] = {0, 0, 0};
    
    // PID controllers for pitch, roll, yaw
    float kp = 1.2, ki = 0.05, kd = 0.8;
    
    // Simplified PID calculation
    pidOutput[0] = kp * droneState.pitch;
    pidOutput[1] = kp * droneState.roll;
    pidOutput[2] = kp * droneState.yaw;
    
    // Distribute to motors
    updateMotorThrust(pidOutput);
}

void updateMotorThrust(float pid[]) {
    float thrust = 1500; // Base thrust
    
    // Motor mixing algorithm
    float m1 = thrust - pid[0] - pid[1] + pid[2];
    float m2 = thrust - pid[0] + pid[1] - pid[2];
    float m3 = thrust + pid[0] - pid[1] - pid[2];
    float m4 = thrust + pid[0] + pid[1] + pid[2];
    
    // Constrain values
    for(float &motor : {m1, m2, m3, m4}) {
        motor = constrain(motor, 1000, 2000);
    }
    
    motors[0].writeMicroseconds(m1);
    motors[1].writeMicroseconds(m2);
    motors[2].writeMicroseconds(m3);
    motors[3].writeMicroseconds(m4);
}

void loop() {
    updateIMU();
    stabilizeAttitude();
    delay(10);
}
        `
    },
    4: {
        title: "Aerogel Based Fire Resistant Suit",
        tech: ["Aerogel Composites", "Material Engineering", "Thermal Sensors", "Hardware Testing"],
        code: `
# Aerogel Fire Resistant Suit - Thermal Monitoring System
import adafruit_dht
import board
import time
import json
from datetime import datetime
from collections import deque

class ThermalMonitoringSystem:
    def __init__(self):
        self.sensors = {
            'chest': adafruit_dht.DHT22(board.D4),
            'arms': adafruit_dht.DHT22(board.D17),
            'legs': adafruit_dht.DHT22(board.D27),
            'back': adafruit_dht.DHT22(board.D22)
        }
        
        self.temp_history = {loc: deque(maxlen=100) for loc in self.sensors}
        self.alert_threshold = 60  # Celsius
        self.critical_threshold = 75
        self.log_file = "thermal_log.json"
    
    def read_temperatures(self):
        """Read temperature from all sensors"""
        temps = {}
        for location, sensor in self.sensors.items():
            try:
                temp = sensor.temperature
                humidity = sensor.humidity
                temps[location] = {
                    'temp': round(temp, 2),
                    'humidity': round(humidity, 2)
                }
                self.temp_history[location].append(temp)
            except RuntimeError:
                temps[location] = {'temp': None, 'humidity': None}
        
        return temps
    
    def check_thermal_alerts(self, temps):
        """Monitor for thermal anomalies"""
        alerts = []
        
        for location, data in temps.items():
            if data['temp'] is None:
                continue
            
            temp = data['temp']
            
            if temp > self.critical_threshold:
                alerts.append({
                    'level': 'CRITICAL',
                    'location': location,
                    'temperature': temp,
                    'timestamp': datetime.now().isoformat()
                })
                print(f"🚨 CRITICAL ALERT at {location}: {temp}°C")
            
            elif temp > self.alert_threshold:
                alerts.append({
                    'level': 'WARNING',
                    'location': location,
                    'temperature': temp,
                    'timestamp': datetime.now().isoformat()
                })
        
        return alerts
    
    def calculate_thermal_gradient(self):
        """Calculate temperature difference between zones"""
        current_temps = [temps[-1] if temps else 0 
                        for temps in self.temp_history.values()]
        
        if len(current_temps) > 1:
            max_temp = max(current_temps)
            min_temp = min([t for t in current_temps if t > 0])
            gradient = max_temp - min_temp
            return round(gradient, 2)
        
        return 0
    
    def log_data(self, temps, alerts):
        """Log thermal data to file"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'temperatures': temps,
            'gradient': self.calculate_thermal_gradient(),
            'alerts': alerts
        }
        
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\\n')

def main():
    monitor = ThermalMonitoringSystem()
    
    print("Aerogel Fire Resistant Suit - Thermal Monitoring System")
    print("=" * 50)
    
    try:
        while True:
            temps = monitor.read_temperatures()
            alerts = monitor.check_thermal_alerts(temps)
            monitor.log_data(temps, alerts)
            
            print(f"\\n[{datetime.now().strftime('%H:%M:%S')}]")
            for location, data in temps.items():
                if data['temp']:
                    print(f"  {location.upper()}: {data['temp']}°C ({data['humidity']}% RH)")
            
            print(f"  Thermal Gradient: {monitor.calculate_thermal_gradient()}°C")
            
            time.sleep(2)
    
    except KeyboardInterrupt:
        print("\\nShutdown initiated...")
    
    finally:
        for sensor in monitor.sensors.values():
            sensor.deinit()

if __name__ == "__main__":
    main()
        `
    },
    5: {
        title: "Smart Solar Powered Agriculture Monitoring System",
        tech: ["Arduino", "ESP32", "Soil Moisture Sensors", "Temperature Sensors", "IoT", "Embedded C", "Solar Power"],
        code: `
// Smart Solar Agriculture System - Sensor Integration & Data Management
#include <Arduino.h>
#include <WiFi.h>
#include <ThingSpeak.h>
#include <DHT.h>

// Pin Definitions
#define SOIL_MOISTURE_PIN A0
#define TEMP_HUMIDITY_PIN 2
#define LIGHT_SENSOR_PIN A1
#define WATER_PUMP_PIN 3
#define BATTERY_PIN A2

// Configuration
#define DHT_TYPE DHT22
#define THINGSPEAK_CHANNEL 1234567
#define THINGSPEAK_API_KEY "YOUR_API_KEY"

// Network
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
WiFiClient client;

// Sensors
DHT dht(TEMP_HUMIDITY_PIN, DHT_TYPE);

struct SensorData {
    float soilMoisture;
    float temperature;
    float humidity;
    int lightIntensity;
    float batteryVoltage;
    unsigned long timestamp;
};

// Thresholds
const float MOISTURE_THRESHOLD = 40.0;  // %
const float TEMP_MAX = 35.0;            // Celsius
const float TEMP_MIN = 15.0;

void setup() {
    Serial.begin(115200);
    
    // Pin Configuration
    pinMode(SOIL_MOISTURE_PIN, INPUT);
    pinMode(LIGHT_SENSOR_PIN, INPUT);
    pinMode(BATTERY_PIN, INPUT);
    pinMode(WATER_PUMP_PIN, OUTPUT);
    
    // Initialize Sensors
    dht.begin();
    
    // WiFi Connection
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\\nWiFi Connected");
    
    ThingSpeak.begin(client);
    
    Serial.println("Smart Agriculture System Ready");
}

SensorData readSensors() {
    SensorData data;
    data.timestamp = millis();
    
    // Read soil moisture (0-1023 → 0-100%)
    int rawMoisture = analogRead(SOIL_MOISTURE_PIN);
    data.soilMoisture = map(rawMoisture, 0, 1023, 0, 100);
    
    // Read temperature and humidity
    data.temperature = dht.readTemperature();
    data.humidity = dht.readHumidity();
    
    // Read light intensity (0-1023)
    data.lightIntensity = analogRead(LIGHT_SENSOR_PIN);
    
    // Read battery voltage
    int rawBattery = analogRead(BATTERY_PIN);
    data.batteryVoltage = (rawBattery / 1023.0) * 5.0;  // Convert to volts
    
    return data;
}

void controlIrrigation(SensorData &data) {
    // Automatic irrigation based on soil moisture
    if (data.soilMoisture < MOISTURE_THRESHOLD) {
        digitalWrite(WATER_PUMP_PIN, HIGH);
        Serial.println("💧 Irrigation ON");
    } else if (data.soilMoisture > (MOISTURE_THRESHOLD + 15)) {
        digitalWrite(WATER_PUMP_PIN, LOW);
        Serial.println("💧 Irrigation OFF");
    }
    
    // Temperature-based alerts
    if (data.temperature > TEMP_MAX) {
        Serial.println("⚠️  High Temperature Alert");
    }
    if (data.temperature < TEMP_MIN) {
        Serial.println("⚠️  Low Temperature Alert");
    }
}

void uploadToCloud(SensorData &data) {
    ThingSpeak.setField(1, data.soilMoisture);
    ThingSpeak.setField(2, data.temperature);
    ThingSpeak.setField(3, data.humidity);
    ThingSpeak.setField(4, data.lightIntensity);
    ThingSpeak.setField(5, data.batteryVoltage);
    
    int x = ThingSpeak.writeFields(THINGSPEAK_CHANNEL, THINGSPEAK_API_KEY);
    
    if (x == 200) {
        Serial.println("✓ Data uploaded to ThingSpeak");
    } else {
        Serial.println("✗ Upload failed");
    }
}

void displayData(SensorData &data) {
    Serial.println("\\n=== Agricultural Data ===");
    Serial.print("Soil Moisture: "); Serial.print(data.soilMoisture); Serial.println("%");
    Serial.print("Temperature: "); Serial.print(data.temperature); Serial.println("°C");
    Serial.print("Humidity: "); Serial.print(data.humidity); Serial.println("%");
    Serial.print("Light: "); Serial.print(data.lightIntensity); Serial.println(" units");
    Serial.print("Battery: "); Serial.print(data.batteryVoltage); Serial.println("V");
    Serial.println("========================\\n");
}

void loop() {
    // Read all sensors
    SensorData sensorData = readSensors();
    
    // Display data
    displayData(sensorData);
    
    // Control irrigation
    controlIrrigation(sensorData);
    
    // Upload to cloud every 15 seconds
    static unsigned long lastUpload = 0;
    if (millis() - lastUpload > 15000) {
        uploadToCloud(sensorData);
        lastUpload = millis();
    }
    
    delay(1000);  // Read sensors every second
}
        `
    }
};

// =============================================
// DOM ELEMENTS
// =============================================

const modal = document.getElementById('projectModal');
const closeBtn = document.querySelector('.close');
const projectCards = document.querySelectorAll('.project-card');
const btnViewCode = document.querySelectorAll('.btn-view-code');

// =============================================
// EVENT LISTENERS
// =============================================

// Project card click handlers
btnViewCode.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = button.closest('.project-card').dataset.project;
        openProjectModal(projectId);
    });
});

// Close modal
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// =============================================
// MODAL FUNCTIONS
// =============================================

function openProjectModal(projectId) {
    const project = projectsData[projectId];
    
    if (project) {
        document.getElementById('modalTitle').textContent = project.title;
        document.getElementById('codeContent').textContent = project.code;
        
        const techTags = document.getElementById('techTags');
        techTags.innerHTML = '';
        project.tech.forEach(tech => {
            const span = document.createElement('span');
            span.textContent = tech;
            techTags.appendChild(span);
        });
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add animation
        const modalContent = document.querySelector('.modal-content');
        modalContent.style.animation = 'slideDown 0.3s ease';
    }
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// =============================================
// SMOOTH SCROLL
// =============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =============================================
// SCROLL ANIMATIONS
// =============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.education-card, .timeline-content, .project-card, .skill-category, .achievement-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// =============================================
// ACTIVE NAV LINK HIGHLIGHTING
// =============================================

window.addEventListener('scroll', () => {
    let currentSection = '';
    
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === currentSection) {
            link.style.color = 'var(--primary)';
        } else {
            link.style.color = 'var(--text-primary)';
        }
    });
});

// =============================================
// DYNAMIC PARTICLE EFFECT ON MOUSE MOVE (OPTIONAL)
// =============================================

document.addEventListener('mousemove', (e) => {
    // This could be enhanced with particle effects
    // Currently left for potential future enhancement
});

// =============================================
// INITIALIZATION
// =============================================

console.log('%c Tamil Selvan S - Portfolio', 'color: #0ff; font-size: 16px; font-weight: bold;');
console.log('%c Electronics & Communication Engineer', 'color: #8f00ff; font-size: 12px;');
console.log('%c https://linkedin.com/in/tamil-selvan-s-bb259b318', 'color: #0ff; font-size: 10px;');
