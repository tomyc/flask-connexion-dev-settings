from datetime import datetime
from config import db, ma
from marshmallow import fields


class Place(db.Model):
    __tablename__ = "place"
    place_id = db.Column(db.Integer, primary_key=True)
    place_name = db.Column(db.String(32))
    description = db.Column(db.String(32))
    timestamp = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    settings = db.relationship(
        "Setting",
        backref="place",
        cascade="all, delete, delete-orphan",
        single_parent=True,
        order_by="desc(Setting.timestamp)",
    )


class Setting(db.Model):
    __tablename__ = "device_setting"
    device_id = db.Column(db.Integer, primary_key=True)
    place_id = db.Column(db.Integer, db.ForeignKey("place.place_id"))
    setting_device_no = db.Column(db.String, nullable=False)  # numer urządzenia
    setting_device_address = db.Column(db.String, nullable=False)  # ADRES
    setting_device_reinforcement = db.Column(db.Integer, nullable=False)  # WZMOCNIENIE
    setting_device_transmission_power = db.Column(db.Integer, nullable=False)  # SIŁA NADAWANIA
    setting_device_bt = db.Column(db.Integer, nullable=False)  # BT 0 – urządzenie wyłączone, 1 – wifi actywne, 2 – bt actywne, 3 – oba włączone
    setting_device_battery_status = db.Column(db.Integer, nullable=False)
    setting_device_state = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class PlaceSchema(ma.ModelSchema):
    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    class Meta:
        model = Place
        sqla_session = db.session

    settings = fields.Nested("PlaceSettingSchema", default=[], many=True)


class PlaceSettingSchema(ma.ModelSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    device_id = fields.Int()
    place_id = fields.Int()
    setting_device_no = fields.Str() #numer urządzenia
    setting_device_address = fields.Str() #ADRES
    setting_device_reinforcement = fields.Int() #WZMOCNIENIE
    setting_device_transmission_power = fields.Int() # SIŁA NADAWANIA
    setting_device_bt = fields.Int() #BT 0 – urządzenie wyłączone, 1 – wifi actywne, 2 – bt actywne, 3 – oba włączone
    setting_device_battery_status = fields.Int()
    setting_device_state = fields.Bool()
    timestamp = fields.Str()


class SettingSchema(ma.ModelSchema):
    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    class Meta:
        model = Setting
        sqla_session = db.session

    place = fields.Nested("SettingPlaceSchema", default=None)


class SettingPlaceSchema(ma.ModelSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    place_id = fields.Int()
    place_name = fields.Str()
    description = fields.Str()
    timestamp = fields.Str()
