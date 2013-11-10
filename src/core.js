/* the concept is inspire form Nigulas Zakas module concept*/

var lego;
(function (lego) {

    lego.core = (function () {
        var moduleData = {};

        return {
            registerModule: function (moduleId, creator) {
                moduleData[moduleId] = {
                    creator: creator,
                    instance: null
                };
            },

            start: function (moduleId) {
                moduleData[moduleId].instance
                    = moduleData[moduleId].creator(/*new Sandbox(this)*/);
                moduleData[moduleId].instance.init();
            },

            getModule: function (moduleId) {
                return moduleData[moduleId].instance;
            },

            extend: extend
        };

        //extend copy from backbone
        function extend(protoProps, staticProps) {
            var parent = this;
            var child;

            // The constructor function for the new subclass is either defined by you
            // (the "constructor" property in your `extend` definition), or defaulted
            // by us to simply call the parent's constructor.
            if (protoProps && _.has(protoProps, 'constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }

            // Add static properties to the constructor function, if supplied.
            _.extend(child, parent, staticProps);

            // Set the prototype chain to inherit from `parent`, without calling
            // `parent`'s constructor function.
            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();

            // Add prototype properties (instance properties) to the subclass,
            // if supplied.
            if (protoProps) _.extend(child.prototype, protoProps);

            // Set a convenience property in case the parent's prototype is needed
            // later.
            child.__super__ = parent.prototype;

            return child;
        }

    }());

    lego.Application = (function () {
        var extend = lego.core.extend;

        function Application(applicationId) {
            this.applicationId = applicationId;
            this.modules = {};
        }

        Application.prototype = {
            registerModule: function (moduleId, dependence, creator) {
                this.modules[moduleId] = {
                    creator: creator,
                    dependence: dependence,
                    instance: null,
                    hasStarted: false
                };
            },

            start: function (moduleId) {
                var module = this.modules[moduleId],
                    dep, innerdep;  //todo: resolve innerdependence using recursive

                dep = resolveDependence.bind(this)(module.dependence);
                dep.forEach(function (element) {
                    if (!element.hasStarted) {
                        innerdep = resolveDependence.bind(this)(element.dependence);
                        element.instance = element.creator(innerdep);
                        element.hasStarted = true;
                    }
                });
                module.instance = module.creator(dep/*new Sandbox(this)*/);
                //todo: move the init function to prototype
                module.instance.init();


                function resolveDependence(dependence) {
                    var result = [], i, l;
                    for (i = 0, l = dependence.length; i < l; i++) {
                        result.push(this.modules[dependence[i]]);
                    }
                    return result;
                }
            },

            bootstrap: function () {
                for(var module in this.modules) {
                    if(this.modules.hasOwnProperty(module)) {
                        if(!this.modules[module].hasStarted) {
                            this.start(module);
                        }
                    }
                }
            }

        };

        Application.extend = extend;

        return Application;
    }());



    lego.Module = (function () {
        var extend = lego.core.extend;

        function Module(moduleId) {
            this.moduleId = moduleId;
        }

        Module.prototype = {
            init: function () {

            }
        };

        Module.extend = extend;

        return Module;

    }());

}(lego || (lego = {})));