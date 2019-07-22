"""
This is the rooms module and supports all the REST actions for the
rooms data
"""

from flask import make_response, abort
from datetime import datetime
from config import db
from models import Place, Setting, SettingSchema


def read_all():
    """
    This function responds to a request for /api/rooms/settings
    with the complete list of settings, sorted by setting timestamp

    :return:                json list of all settings for all rooms
    """
    # Query the database for all the settings
    settings = Setting.query.order_by(db.desc(Setting.timestamp)).all()

    # Serialize the list of settings from our data
    setting_schema = SettingSchema(many=True, exclude=["place.settings"])
    data = setting_schema.dump(settings).data
    return data


def read_one(place_id, device_id):
    """
    This function responds to a request for
    /api/rooms/{place_id}/settings/{device_id}
    with one matching setting for the associated place

    :param place_id:       Id of place the setting is related to
    :param device_id:         Id of the setting
    :return:                json string of setting description
    """
    # Query the database for the device' settings
    setting = (
        Setting.query.join(Place, Place.place_id == Setting.place_id)
            .filter(Place.place_id == place_id)
            .filter(Setting.device_id == device_id)
            .one_or_none()
    )

    # Was a setting found?
    if setting is not None:
        setting_schema = SettingSchema()
        data = setting_schema.dump(setting).data
        return data

    # Otherwise, nope, didn't find that setting
    else:
        abort(404, f"Setting not found for Device Id: {device_id}")


def create(place_id, setting_data):
    """
    This function creates a new setting related to the passed in place id.

    :param place_id:       Id of the place the setting is related to
    :param setting_data:   The JSON containing the setting data (setting, setting_device_address)
    :return:               201 on success
    """
    # get the parent place
    place = Place.query.filter(Place.place_id == place_id).one_or_none()

    # Was a place found?
    if place is None:
        abort(404, f"Place not found for Id: {place_id}")

    # Create a setting schema instance
    schema = SettingSchema()

    new_setting = schema.load(setting_data, session=db.session).data

    # Add the setting to the place and database
    place.settings.append(new_setting)
    db.session.commit()

    # Serialize and return the newly created setting in the response
    data = schema.dump(new_setting).data

    return data, 201


def update(place_id, device_id, setting):
    """
    This function updates an existing setting related to the passed in
    place id.

    :param place_id:       Id of the place the setting is related to
    :param device_id:     Id of the setting to update
    :param setting:        The JSON containing the setting data
    :param setting_device_address:  The JSON containing the setting image
    :return:               200 on success
    """
    update_setting = (
        Setting.query.filter(Place.place_id == place_id)
            .filter(Setting.device_id == device_id)
            .one_or_none()
    )

    # Did we find an existing setting?
    if update_setting is not None:

        # turn the passed in setting into a db object
        setting['setting_device_no']=update_setting.setting_device_no
        setting['setting_device_address']=update_setting.setting_device_address
        setting['setting_device_state'] = update_setting.setting_device_state
        setting['setting_device_battery_status'] = update_setting.setting_device_battery_status
        schema = SettingSchema()
        update = schema.load(setting, session=db.session).data

        # Set the id's to the setting we want to update
        update.place_id = update_setting.place_id
        update.device_id = update_setting.device_id
        update.setting_device_battery_status = update_setting.setting_device_battery_status


        # merge the new object into the old and commit it to the db
        db.session.merge(update)
        db.session.commit()

        # return updated setting in the response
        data = schema.dump(update_setting).data

        return data, 200

    # Otherwise, nope, didn't find that setting
    else:
        abort(404, f"Setting not found for Device Id: {device_id}")


def delete(place_id, device_id):
    """
    This function deletes a setting from the setting structure

    :param place_id:   Id of the place the setting is related to
    :param device_id:     Id of the device to delete
    :return:            200 on successful delete, 404 if not found
    """
    # Get the setting requested
    setting = (
        Setting.query.filter(Place.place_id == place_id)
            .filter(Setting.device_id == device_id)
            .one_or_none()
    )

    # did we find a setting?
    if setting is not None:
        db.session.delete(setting)
        db.session.commit()
        return make_response(
            "Setting of the device with id {device_id} deleted".format(device_id=device_id), 200
        )

    # Otherwise, nope, didn't find that setting
    else:
        abort(404, f"Setting not found for device Id: {device_id}")
