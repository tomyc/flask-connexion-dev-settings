"""
Main module of the server file
"""

# 3rd party moudles
from flask import render_template

# Local modules
import config


# Get the application instance
connex_app = config.connex_app

# Read the swagger.yml file to configure the endpoints
connex_app.add_api("swagger.yml")


# Create a URL route in our application for "/"
@connex_app.route("/")
def home():
    """
    This function just responds to the browser URL
    localhost:5000/

    :return:        the rendered template "home.html"
    """
    return render_template("home.html")


# Create a URL route in our application for "/rooms"
@connex_app.route("/rooms")
@connex_app.route("/rooms/<place_id>")
def rooms(place_id=""):
    """
    This function just responds to the browser URL
    localhost:5000/rooms

    :return:        the rendered template "rooms.html"
    """
    return render_template("rooms.html", place_id=place_id)


# Create a URL route to the settings page
@connex_app.route("/rooms/<place_id>")
@connex_app.route("/rooms/<place_id>/settings")
@connex_app.route("/rooms/<place_id>/settings/<device_id>")
def settings(place_id, device_id=""):
    """
    This function responds to the browser URL
    localhost:5000/settings/<place_id>

    :param place_id:   Id of the place to show settings for
    :return:            the rendered template "settings.html"
    """
    return render_template("settings.html", place_id=place_id, device_id=device_id)


if __name__ == "__main__":
    connex_app.run(debug=True)
