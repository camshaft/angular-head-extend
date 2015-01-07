/**
 * Module dependencies
 */

var angular = window.angular;
var name = 'head-extend';

var mod = module.exports = window.angular.module(name, []);

mod.name = name;

mod.directive('headExtend', [
  '$compile',
  function($compile) {
    var head = angular.element(document.head);

    var origMetas = Array.prototype.reduce.call(head.find('meta'), function(acc, meta) {
      var name = meta.name || meta.property;
      if (!name) return acc;
      acc[name] = angular.element(meta);
      return acc;
    }, {});

    function replace(prev, tmpl, $scope) {
      if (!tmpl) return;
      var el = tmpl($scope);

      prev && prev.parent().length ? prev.replaceWith(el) : head.append(el);

      $scope.$on('$destroy', function() {
        prev && prev.parent().length ? el.replaceWith(prev) : el.remove();
      });
    }

    return {
      restrict: 'AE',
      compile: function(tEl, tAttrs) {
        tEl.remove();

        var titleEl = tEl.find('title')[0];
        var title = titleEl ? $compile(titleEl.outerHTML) : null;

        var metas = Array.prototype.map.call(tEl.find('meta'), function(meta) {
          var name = meta.name;
          return {tmpl: $compile(meta.outerHTML), orig: origMetas[name]};
        });

        var links = Array.prototype.map.call(tEl.find('link'), function(link) {
          return $compile(link.outerHTML);
        });

        tEl.html('');
        var html = $compile(tEl[0].outerHTML.replace('head-extend', 'div'));

        return function($scope, el, attrs) {
          html($scope);
          replace(head.find('title'), title, $scope);
          metas.forEach(function(meta) {
            replace(meta.orig, meta.tmpl, $scope);
          });
          links.forEach(function(link) {
            replace(null, link, $scope);
          });
        };
      }
    };
  }
]);
