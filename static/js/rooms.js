/*
 * JavaScript file for the application to demonstrate
 * using the API for the Rooms SPA
 */

// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function () {
    'use strict';

    // Return the API
    return {
        read_one: function (place_id) {
            let ajax_options = {
                type: 'GET',
                url: `/api/rooms/${place_id}`,
                accepts: 'application/json',
                dataType: 'json'
            };
            return $.ajax(ajax_options);
        },
        read: function () {
            let ajax_options = {
                type: 'GET',
                url: '/api/rooms',
                accepts: 'application/json',
                dataType: 'json'
            };
            return $.ajax(ajax_options);
        },
        create: function (place) {
            let ajax_options = {
                type: 'POST',
                url: '/api/rooms',
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(place)
            };
            return $.ajax(ajax_options);
        },
        update: function (place) {
            let ajax_options = {
                type: 'PUT',
                url: `/api/rooms/${place.place_id}`,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(place)
            };
            return $.ajax(ajax_options);
        },
        'delete': function (place_id) {
            let ajax_options = {
                type: 'DELETE',
                url: `/api/rooms/${place_id}`,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            return $.ajax(ajax_options);
        }
    };
}());

// Create the view instance
ns.view = (function () {
    'use strict';

    const NEW_setting = 0,
        EXISTING_setting = 1;

    let $place_id = $('#place_id'),
        $description = $('#description'),
        $place_name = $('#place_name'),
        $create = $('#create'),
        $update = $('#update'),
        $delete = $('#delete'),
        $reset = $('#reset');

    // return the API
    return {
        NEW_RECONSTRUCTION: NEW_RECONSTRUCTION,
        EXISTING_RECONSTRUCTION: EXISTING_RECONSTRUCTION,
        reset: function () {
            $place_id.text('');
            $place_name.val('');
            $description.val('').focus();
        },
        update_editor: function (place) {
            $place_id.text(place.place_id);
            $place_name.val(place.place_name);
            $description.val(place.description).focus();
        },
        set_button_state: function (state) {
            if (state === NEW_RECONSTRUCTION) {
                $create.prop('disabled', false);
                $update.prop('disabled', true);
                $delete.prop('disabled', true);
            } else if (state === EXISTING_RECONSTRUCTION) {
                $create.prop('disabled', true);
                $update.prop('disabled', false);
                $delete.prop('disabled', false);
            }
        },
        build_table: function (rooms) {
            let source = $('#rooms-table-template').html(),
                template = Handlebars.compile(source),
                html;

            // clear the table
            $('.rooms table > tbody').empty();

            // did we get a rooms array?
            if (rooms) {

                // Create the HTML from the template and rooms
                html = template({rooms: rooms})
                // Append the html to the table
                $('table').append(html);
            }
        },
        error: function (error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function () {
                $('.error').fadeOut();
            }, 2000)
        }
    };
}());

// Create the controller
ns.controller = (function (m, v) {
    'use strict';

    let model = m,
        view = v,
        $url_place_id = $('#url_place_id'),
        $place_id = $('#place_id'),
        $description = $('#description'),
        $place_name = $('#place_name');

    // Get the data from the model after the controller is done initializing
    setTimeout(function () {
        view.reset();
        model.read()
            .done(function(data) {
                view.build_table(data);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                error_handler(xhr, textStatus, errorThrown);
            })

        if ($url_place_id.val() !== "") {
            model.read_one(parseInt($url_place_id.val()))
                .done(function(data) {
                    view.update_editor(data);
                    view.set_button_state(view.EXISTING_RECONSTRUCTION);
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                });
        }
    }, 100)

    // generic error handler
    function error_handler(xhr, textStatus, errorThrown) {
        let error_msg = `${textStatus}: ${errorThrown} - ${xhr.responseJSON.detail}`;

        view.error(error_msg);
        console.log(error_msg);
    }
    // initialize the button states
    view.set_button_state(view.NEW_RECONSTRUCTION);

    // Validate input
    function validate(description, place_name) {
        return description !== "" && place_name !== "";
    }

    // Create our event handlers
    $('#create').click(function (e) {
        let description = $description.val(),
            place_name = $place_name.val();

        e.preventDefault();

        if (validate(description, place_name)) {
            model.create({
                'description': description,
                'place_name': place_name,
            })
                .done(function(data) {
                    model.read()
                        .done(function(data) {
                            view.build_table(data);
                        })
                        .fail(function(xhr, textStatus, errorThrown) {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.set_button_state(view.NEW_RECONSTRUCTION);
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                });

            view.reset();

        } else {
            alert('Problem with first or last name input');
        }
    });

    $('#update').click(function (e) {
        let place_id = parseInt($place_id.text()),
            description = $description.val(),
            place_name = $place_name.val();

        e.preventDefault();

        if (validate(description, place_name)) {
            model.update({
                place_id: place_id,
                description: description,
                place_name: place_name,
            })
                .done(function(data) {
                    model.read()
                        .done(function(data) {
                            view.build_table(data);
                        })
                        .fail(function(xhr, textStatus, errorThrown) {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_state(view.NEW_RECONSTRUCTION);
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                })

        } else {
            alert('Problem with first or last name input');
        }
        e.preventDefault();
    });

    $('#delete').click(function (e) {
        let place_id = parseInt($place_id.text());

        e.preventDefault();

        if (validate('placeholder', place_name)) {
            model.delete(place_id)
                .done(function(data) {
                    model.read()
                        .done(function(data) {
                            view.build_table(data);
                        })
                        .fail(function(xhr, textStatus, errorThrown) {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_state(view.NEW_RECONSTRUCTION);
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                });

        } else {
            alert('Problem with first or last name input');
        }
    });

    $('#reset').click(function () {
        view.reset();
        view.set_button_state(view.NEW_RECONSTRUCTION);
    })

    $('table').on('click', 'tbody tr', function (e) {
        let $target = $(e.target).parent(),
            place_id = $target.data('place_id'),
            description = $target.data('description'),
            place_name = $target.data('place_name');

        view.update_editor({
            place_id: place_id,
            description: description,
            place_name: place_name,
        });
        view.set_button_state(view.EXISTING_RECONSTRUCTION);
    });

    $('table').on('dblclick', 'tbody tr', function (e) {
        let $target = $(e.target),
            place_id = $target.parent().attr('data-place_id');

        window.location.href = `/rooms/${place_id}/settings`;

    });
}(ns.model, ns.view));


