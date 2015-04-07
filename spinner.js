/*global console*/

/**
 * Spinner knockout handler
 * <div data-bind="spinner:{ value: quantity, max: 12, min:0, step:1 }"></div>
 */

require([
    'jquery',
    'knockout'
], function ($, ko) {

    // <div data-bind="
    //    template:{ name: 'spinner-template' },
    //    spinner:{ value: product.quantity }">
    // </div>
    var defaultSettings = {
        template: [
            '<div class="input-group spinner">',
            '<a class="btn btn-default input-group-addon btn-down">-</a>',
            '<input class="form-control" type="text" />',
            '<a class="btn btn-default input-group-addon btn-up">+</a>',
            '</div>'
        ].join('')
    };

    ko.bindingHandlers.spinner = {
        init: function (element, valueAccessor, allBindings) {
            var $el = $(element),
                options = ko.utils.unwrapObservable(valueAccessor()) || {},
                template = defaultSettings.template;

            function isObv(k) {
                return options.hasOwnProperty(k) && ko.isObservable(options[k]);
            }

            if (!isObv('value')) {
                return console.info('value should be observable');
            }

            if (!allBindings.has('template')) {
                $el.html(template);
            }

            ko.applyBindingsToNode($el.find('.form-control').get(0), options);

            if (!isObv('min')) {
                options.min =  ko.observable(+options.min > 0 ? +options.min : 0);
            }
            if (!isObv('max')) {
                options.max =  ko.observable(+options.max || 9999);
            }

            var $up = $el.find('.btn-up'),
                $down = $el.find('.btn-down'),
                min = options.min(),
                max = options.max(),
                step = +options.step > 0 ? +options.step : 1;

            ko.computed(function () {
                min = options.min();
                max =  options.max();
            });

            options.value.subscribe(function (newValue) {
                if (newValue > max) {
                    options.value(max);
                } else if (newValue < min) {
                    options.value(min);
                }
            });

            // Disable up/down buttons depending on 'value' and 'disable' observables
            var disableDownButton = ko.computed(function () {
                if (options.hasOwnProperty('disable') && ko.isObservable(options.disable)) {
                    return options.disable() || options.value() <= min;
                }
                return options.value() <= min;
            });

            var disableUpButton = ko.computed(function () {
                if (options.hasOwnProperty('disable') && ko.isObservable(options.disable)) {
                    return options.disable() || options.value() >= max;
                }
                return options.value() >= max;
            });

            disableDownButton.subscribe(function (disable) {
                $down.toggleClass('disabled', disable);
            });

            disableUpButton.subscribe(function (disable) {
                $up.toggleClass('disabled', disable);
            });

            // Set initial states of up/down buttons
            $down.toggleClass('disabled', options.value() <= min);
            $up.toggleClass('disabled', options.value() >= max);

            $el.on('click', '.btn-down', function () {
                options.value((options.value() | 0) - step);
                //callback if any
                if (options.decrementCb && typeof options.decrementCb === 'function') {
                    options.decrementCb();
                }
            });

            $el.on('click', '.btn-up', function () {
                options.value((options.value() | 0) + step);
                //callback if any
                if (options.incrementCb && typeof options.incrementCb === 'function') {
                    options.incrementCb();
                }
            });
        }
    };
});
