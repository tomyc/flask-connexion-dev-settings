import os
from datetime import datetime
from config import db
from models import Place, Setting

# Data to initialize database with
ROOMS = [
    {
        "description": "Data Science in Applications",
        "place_name": "Room 001",
        "settings": [
            (
                "001",
                "00010001",
                2,
                4,
                2,
                252,
                1,
                "2019-01-06 22:17:54"
            ),
            (
                "002",
                "00010101",
                1,
                2,
                3,
                202,
                1,
                "2019-01-08 22:17:54"
            ),
            (
                "003",
                "00010111",
                2,
                4,
                2,
                252,
                1,
                "2019-03-06 22:17:54"
            ),
        ],
    },
    {
        "description": "Room of Sadness",
        "place_name": "Room 200",
        "settings": [
            (
                "001",
                "00011001",
                2,
                4,
                2,
                252,
                1,
                "2019-01-07 22:17:54",
            ),
            (
                "011",
                "00010101",
                2,
                4,
                2,
                252,
                1,
                "2019-02-06 22:17:54",
            ),
        ],
    },
    {
        "description": "Bunny' Room",
        "place_name": "Room 271",
        "settings": [
            (
                "001",
                "00011001",
                2,
                4,
                2,
                252,
                1,
                "2019-01-07 22:47:54"),
            (
                "001",
                "00011101",
                2,
                4,
                2,
                252,
                1,
                "2019-04-06 22:17:54"
            ),
        ],
    },
]

# Delete database file if it exists currently
if os.path.exists("settings.db"):
    os.remove("settings.db")

# Create the database
db.create_all()

# iterate over the ROOMS structure and populate the database
for place in ROOMS:
    p = Place(place_name=place.get("place_name"), description=place.get("description"))

    # Add the settings for the place
    for setting in place.get("settings"):
        setting_device_no, \
        setting_device_address, \
        setting_device_reinforcement, \
        setting_device_transmission_power, \
        setting_device_bt, \
        setting_device_battery_status, \
        setting_device_state, \
        timestamp = setting
        p.settings.append(
            Setting(
                setting_device_no = setting_device_no,
                setting_device_address = setting_device_address,
                setting_device_reinforcement = setting_device_reinforcement,
                setting_device_transmission_power = setting_device_transmission_power,
                setting_device_bt = setting_device_bt,
                setting_device_battery_status = setting_device_battery_status,
                setting_device_state = setting_device_state,
                timestamp=datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S"),
            )
        )
    db.session.add(p)

db.session.commit()
