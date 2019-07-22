"""
This is the rooms module and supports all the REST actions for the
rooms data
"""

from flask import make_response, abort
from config import db
from models import Place, PlaceSchema, Setting


def read_all():
    """
    This function responds to a request for /api/rooms
    with the complete lists of rooms

    :return:        json string of list of rooms
    """
    # Create the list of rooms from our data
    rooms = Place.query.order_by(Place.place_id).all()

    # Serialize the data for the response
    place_schema = PlaceSchema(many=True)
    data = place_schema.dump(rooms).data
    return data


def read_one(place_id):
    """
    This function responds to a request for /api/rooms/{place_id}
    with one matching place from rooms

    :param place_id:   Id of place to find
    :return:            place matching id
    """
    # Build the initial query
    place = (
        Place.query.filter(Place.place_id == place_id)
        .outerjoin(Setting)
        .order_by(db.desc(Setting.device_id))
        .one_or_none()
    )

    # Did we find a place?
    if place is not None:

        # Serialize the data for the response
        place_schema = PlaceSchema()
        data = place_schema.dump(place).data
        return data

    # Otherwise, nope, didn't find that place
    else:
        abort(404, f"Place not found for Id: {place_id}")


def create(place):
    """
    This function creates a new place in the rooms structure
    based on the passed in place data

    :param place:  place to create in rooms structure
    :return:        201 on success, 406 on place exists
    """
    description = place.get("description")
    place_name = place.get("place_name")

    existing_place = (
        Place.query.filter(Place.description == description)
        .filter(Place.place_name == place_name)
        .one_or_none()
    )

    # Can we insert this place?
    if existing_place is None:

        # Create a place instance using the schema and the passed in place
        schema = PlaceSchema()
        new_place = schema.load(place, session=db.session).data

        # Add the place to the database
        db.session.add(new_place)
        db.session.commit()

        # Serialize and return the newly created place in the response
        data = schema.dump(new_place).data

        return data, 201

    # Otherwise, nope, place exists already
    else:
        abort(409, f"Place {description} {place_name} exists already")


def update(place_id, place):
    """
    This function updates an existing place in the rooms structure

    :param place_id:   Id of the place to update in the rooms structure
    :param place:      place to update
    :return:            updated place structure
    """
    # Get the place requested from the db into session
    update_place = Place.query.filter(
        Place.place_id == place_id
    ).one_or_none()

    # Did we find an existing place?
    if update_place is not None:

        # turn the passed in place into a db object
        schema = PlaceSchema()
        update = schema.load(place, session=db.session).data

        # Set the id to the place we want to update
        update.place_id = update_place.place_id

        # merge the new object into the old and commit it to the db
        db.session.merge(update)
        db.session.commit()

        # return updated place in the response
        data = schema.dump(update_place).data

        return data, 200

    # Otherwise, nope, didn't find that place
    else:
        abort(404, f"Place not found for Id: {place_id}")


def delete(place_id):
    """
    This function deletes a place from the rooms structure

    :param place_id:   Id of the place to delete
    :return:            200 on successful delete, 404 if not found
    """
    # Get the place requested
    place = Place.query.filter(Place.place_id == place_id).one_or_none()

    # Did we find a place?
    if place is not None:
        db.session.delete(place)
        db.session.commit()
        return make_response(f"Place {place_id} deleted", 200)

    # Otherwise, nope, didn't find that place
    else:
        abort(404, f"Place not found for Id: {place_id}")
