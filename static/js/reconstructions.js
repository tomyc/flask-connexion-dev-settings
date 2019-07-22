/*
 * JavaScript file for the application to demonstrate
 * using the API for creating, updating and deleting settings
 */

// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function () {
    'use strict';

    // Return the API
    return {
        read_one: function (place_id, device_id) {
            let ajax_options = {
                type: 'GET',
                url: `/api/rooms/${place_id}/settings/${device_id}`,
                accepts: 'application/json',
                dataType: 'json'
            };
            return $.ajax(ajax_options);
        },
        read: function (place_id) {
            let ajax_options = {
                type: 'GET',
                url: `/api/rooms/${place_id}`,
                accepts: 'application/json',
                dataType: 'json'
            };
            return $.ajax(ajax_options);
        },
        create: function (place_id, setting) {
            let ajax_options = {
                type: 'POST',
                url: `/api/rooms/${place_id}/settings`,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(setting)
            };
            return $.ajax(ajax_options);
        },
        update: function (place_id, setting) {
            let ajax_options = {
                type: 'PUT',
                url: `/api/rooms/${place_id}/settings/${setting.device_id}`,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(setting)
            };
            return $.ajax(ajax_options);
        },
        'delete': function (place_id, device_id) {
            let ajax_options = {
                type: 'DELETE',
                url: `/api/rooms/${place_id}/settings/${device_id}`,
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

    const NEW_RECONSTRUCTION = 0,
        EXISTING_RECONSTRUCTION = 1;

    let $place_id = $('#place_id'),
        $description = $('#description'),
        $place_name = $('#place_name'),
        $timestamp = $('#timestamp'),
        $setting_id = $('#device_id'),
        $setting = $('#setting'),
        $create = $('#create'),
        $update = $('#update'),
        $delete = $('#delete'),
        $reset = $('#reset');

    // return the API
    return {
        NEW_RECONSTRUCTION: NEW_RECONSTRUCTION,
        EXISTING_RECONSTRUCTION: EXISTING_RECONSTRUCTION,
        reset: function () {
            $setting_id.text('');
            $setting.val('').focus();
        },
        update_editor: function (setting) {
            $setting_id.text(setting.device_id);
            $setting.val(setting.setting).focus();
            $setting.val(setting.setting_device_address).focus();
        },
        set_button_states: function (state) {
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
        build_table: function (place) {
            let source = $('#settings-table-template').html(),
                template = Handlebars.compile(source),
                html;

            // update the place data
            $place_id.text(place.place_id);
            $description.text(place.description);
            $place_name.text(place.place_name);
            $timestamp.text(place.timestamp);

            // clear the table
            $('.settings table > tbody').empty();

            // did we get a setting array?
            if (place.settings) {

                // Create the HTML from the template and settings
                html = template({settings: place.settings});

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
        $url_setting_id = $('#url_setting_id'),
        $setting_id = $('#device_id'),
        $setting = $('#setting');

    // read the place data with settings
    setTimeout(function () {
        view.reset();
        model.read(parseInt($url_place_id.val()))
            .done(function (data) {
                view.build_table(data);
                view.update_editor(data);
                view.set_button_states(view.NEW_RECONSTRUCTION);
            })
            .fail(function (xhr, textStatus, errorThrown) {
                error_handler(xhr, textStatus, errorThrown);
            });

        if ($url_setting_id.val() !== "") {
            model.read_one(parseInt($url_place_id.val()), parseInt($url_setting_id.val()))
                .done(function (data) {
                    view.update_editor(data);
                    view.set_button_states(view.EXISTING_RECONSTRUCTION);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                });
        }
    }, 100);

    // generic error handler
    function error_handler(xhr, textStatus, errorThrown) {
        let error_msg = `${textStatus}: ${errorThrown} - ${xhr.responseJSON.detail}`;

        view.error(error_msg);
        console.log(error_msg);
    }

    // initialize the button states
    view.set_button_states(view.NEW_RECONSTRUCTION);

    // Validate input
    function validate(setting) {
        return setting !== "";
    }

    // Create our event handlers
    $('#create').click(function (e) {
        let setting = $setting.val();

        e.preventDefault();

        if (validate(setting)) {
            model.create(parseInt($('#url_place_id').val()), {
                setting: setting
            })
                .done(function (data) {
                    model.read(parseInt($('#url_place_id').val()))
                        .done(function(data) {
                            view.build_table(data);
                        })
                        .fail(function(xhr, textStatus, errorThrown) {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_states(view.NEW_RECONSTRUCTION);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                });

        } else {
            alert('Problem with setting input');
        }
    });

    $('#update').click(function (e) {
        let place_id = parseInt($url_place_id.val()),
            device_id = parseInt($setting_id.text()),
            setting = $setting.val();

        e.preventDefault();

        if (validate(setting)) {
            model.update(place_id, {
                device_id: device_id,
                setting: setting
            })
                .done(function (data) {
                    model.read(data.place.place_id)
                        .done(function(data) {
                            view.build_table(data);
                        })
                        .fail(function(xhr, textStatus, errorThrown) {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_states(view.NEW_RECONSTRUCTION);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                });

        } else {
            alert('Problem with first or last name input');
        }
    });

    $('#delete').click(function (e) {
        let place_id = parseInt($url_place_id.val()),
            device_id = parseInt($setting_id.text());

        e.preventDefault();

        if (validate('placeholder', place_name)) {
            model.delete(place_id, device_id)
                .done(function (data) {
                    model.read(parseInt($('#url_place_id').val()))
                        .done(function(data) {
                            view.build_table(data);
                        })
                        .fail(function(xhr, textStatus, errorThrown) {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_states(view.NEW_RECONSTRUCTION);
                })
                .fail(function (xhr, textStatus, errorThrown) {
                    error_handler(xhr, textStatus, errorThrown);
                });

        } else {
            alert('Problem with room number or description input');
        }
    });

    $('#reset').click(function () {
        view.reset();
        view.set_button_states(view.NEW_RECONSTRUCTION);
    })

    $('table').on('click', 'tbody tr', function (e) {
        let $target = $(e.target).parent(),
            device_id = $target.data('device_id'),
            setting = $target.data('setting');
            setting_device_address = $target.data('setting_device_address');

        view.update_editor({
            device_id: device_id,
            setting: setting,
            setting_device_address: setting_device_address,
        });
        view.set_button_states(view.EXISTING_RECONSTRUCTION);
    });
}(ns.model, ns.view));


