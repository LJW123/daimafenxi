!(function r(s, h, u) {
  function a(t, e) {
    if (!h[t]) {
      if (!s[t]) {
        var n = 'function' == typeof require && require;
        if (!e && n) return n(t, !0);
        if (c) return c(t, !0);
        var i = new Error("Cannot find module '" + t + "'");
        throw ((i.code = 'MODULE_NOT_FOUND'), i);
      }
      var o = (h[t] = { exports: {} });
      s[t][0].call(
        o.exports,
        function (e) {
          return a(s[t][1][e] || e);
        },
        o,
        o.exports,
        r,
        s,
        h,
        u,
      );
    }
    return h[t].exports;
  }
  for (
    var c = 'function' == typeof require && require, e = 0;
    e < u.length;
    e++
  )
    a(u[e]);
  return a;
})(
  {
    1: [
      function (e, t, n) {
        'use strict';
        var s = e('@mapbox/mapbox-gl-sync-move'),
          h = e('events').EventEmitter;
        function i(e, t, n, i) {
          if (
            ((this.options = i || {}),
            (this._mapA = e),
            (this._mapB = t),
            (this._horizontal = 'horizontal' === this.options.orientation),
            (this._onDown = this._onDown.bind(this)),
            (this._onMove = this._onMove.bind(this)),
            (this._onMouseUp = this._onMouseUp.bind(this)),
            (this._onTouchEnd = this._onTouchEnd.bind(this)),
            (this._ev = new h()),
            (this._swiper = document.createElement('div')),
            (this._swiper.className = this._horizontal
              ? 'compare-swiper-horizontal'
              : 'compare-swiper-vertical'),
            (this._controlContainer = document.createElement('div')),
            (this._controlContainer.className = this._horizontal
              ? 'mapboxgl-compare mapboxgl-compare-horizontal'
              : 'mapboxgl-compare'),
            (this._controlContainer.className =
              this._controlContainer.className),
            this._controlContainer.appendChild(this._swiper),
            'string' == typeof n && document.body.querySelectorAll)
          ) {
            var o = document.body.querySelectorAll(n)[0];
            if (!o)
              throw new Error(
                'Cannot find element with specified container selector.',
              );
            o.appendChild(this._controlContainer);
          } else {
            if (!(n instanceof Element && n.appendChild))
              throw new Error(
                'Invalid container specified. Must be CSS selector or HTML element.',
              );
            n.appendChild(this._controlContainer);
          }
          this._bounds = t.getContainer().getBoundingClientRect();
          var r =
            (this._horizontal ? this._bounds.height : this._bounds.width) / 2;
          this._setPosition(r),
            (this._clearSync = s(e, t)),
            (this._onResize = function () {
              (this._bounds = t.getContainer().getBoundingClientRect()),
                this.currentPosition && this._setPosition(this.currentPosition);
            }.bind(this)),
            t.on('resize', this._onResize),
            this.options &&
              this.options.mousemove &&
              (e.getContainer().addEventListener('mousemove', this._onMove),
              t.getContainer().addEventListener('mousemove', this._onMove)),
            this._swiper.addEventListener('mousedown', this._onDown),
            this._swiper.addEventListener('touchstart', this._onDown);
        }
        (i.prototype = {
          _setPointerEvents: function (e) {
            (this._controlContainer.style.pointerEvents = e),
              (this._swiper.style.pointerEvents = e);
          },
          _onDown: function (e) {
            e.touches
              ? (document.addEventListener('touchmove', this._onMove),
                document.addEventListener('touchend', this._onTouchEnd))
              : (document.addEventListener('mousemove', this._onMove),
                document.addEventListener('mouseup', this._onMouseUp));
          },
          _setPosition: function (e) {
            e = Math.min(
              e,
              this._horizontal ? this._bounds.height : this._bounds.width,
            );
            var t = this._horizontal
              ? 'translate(0, ' + e + 'px)'
              : 'translate(' + e + 'px, 0)';
            (this._controlContainer.style.transform = t),
              (this._controlContainer.style.WebkitTransform = t);
            var n = this._horizontal
                ? 'rect(0, 999em, ' + e + 'px, 0)'
                : 'rect(0, ' + e + 'px, ' + this._bounds.height + 'px, 0)',
              i = this._horizontal
                ? 'rect(' + e + 'px, 999em, ' + this._bounds.height + 'px,0)'
                : 'rect(0, 999em, ' + this._bounds.height + 'px,' + e + 'px)';
            (this._mapA.getContainer().style.clip = n),
              (this._mapB.getContainer().style.clip = i),
              (this.currentPosition = e);
          },
          _onMove: function (e) {
            this.options &&
              this.options.mousemove &&
              this._setPointerEvents(e.touches ? 'auto' : 'none'),
              this._horizontal
                ? this._setPosition(this._getY(e))
                : this._setPosition(this._getX(e));
          },
          _onMouseUp: function () {
            document.removeEventListener('mousemove', this._onMove),
              document.removeEventListener('mouseup', this._onMouseUp),
              this.fire('slideend', { currentPosition: this.currentPosition });
          },
          _onTouchEnd: function () {
            document.removeEventListener('touchmove', this._onMove),
              document.removeEventListener('touchend', this._onTouchEnd);
          },
          _getX: function (e) {
            var t =
              (e = e.touches ? e.touches[0] : e).clientX - this._bounds.left;
            return (
              t < 0 && (t = 0),
              t > this._bounds.width && (t = this._bounds.width),
              t
            );
          },
          _getY: function (e) {
            var t =
              (e = e.touches ? e.touches[0] : e).clientY - this._bounds.top;
            return (
              t < 0 && (t = 0),
              t > this._bounds.height && (t = this._bounds.height),
              t
            );
          },
          setSlider: function (e) {
            this._setPosition(e);
          },
          on: function (e, t) {
            return this._ev.on(e, t), this;
          },
          fire: function (e, t) {
            return this._ev.emit(e, t), this;
          },
          off: function (e, t) {
            return this._ev.removeListener(e, t), this;
          },
          remove: function () {
            this._clearSync(), this._mapB.off('resize', this._onResize);
            var e = this._mapA.getContainer();
            e &&
              ((e.style.clip = null),
              e.removeEventListener('mousemove', this._onMove));
            var t = this._mapB.getContainer();
            t &&
              ((t.style.clip = null),
              t.removeEventListener('mousemove', this._onMove)),
              this._swiper.removeEventListener('mousedown', this._onDown),
              this._swiper.removeEventListener('touchstart', this._onDown),
              this._controlContainer.remove();
          },
        }),
          window.mapboxgl
            ? (mapboxgl.Compare = i)
            : void 0 !== t && (t.exports = i);
      },
      { '@mapbox/mapbox-gl-sync-move': 2, events: 3 },
    ],
    2: [
      function (e, t, n) {
        t.exports = function () {
          var t,
            e = arguments.length;
          if (1 === e) t = arguments[0];
          else {
            t = [];
            for (var n = 0; n < e; n++) t.push(arguments[n]);
          }
          var i = [];
          function o() {
            t.forEach(function (e, t) {
              e.on('move', i[t]);
            });
          }
          function r() {
            t.forEach(function (e, t) {
              e.off('move', i[t]);
            });
          }
          return (
            t.forEach(function (e, n) {
              i[n] = function (e, t) {
                r(),
                  (function (e, t) {
                    var n = e.getCenter(),
                      i = e.getZoom(),
                      o = e.getBearing(),
                      r = e.getPitch();
                    t.forEach(function (e) {
                      e.jumpTo({ center: n, zoom: i, bearing: o, pitch: r });
                    });
                  })(e, t),
                  o();
              }.bind(
                null,
                e,
                t.filter(function (e, t) {
                  return t !== n;
                }),
              );
            }),
            o(),
            function () {
              r(), (i = []);
            }
          );
        };
      },
      {},
    ],
    3: [
      function (e, t, n) {
        var u =
            Object.create ||
            function (e) {
              function t() {}
              return (t.prototype = e), new t();
            },
          s =
            Object.keys ||
            function (e) {
              var t = [];
              for (var n in e)
                Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
              return n;
            },
          r =
            Function.prototype.bind ||
            function (e) {
              var t = this;
              return function () {
                return t.apply(e, arguments);
              };
            };
        function i() {
          (this._events &&
            Object.prototype.hasOwnProperty.call(this, '_events')) ||
            ((this._events = u(null)), (this._eventsCount = 0)),
            (this._maxListeners = this._maxListeners || void 0);
        }
        (((t.exports = i).EventEmitter = i).prototype._events = void 0),
          (i.prototype._maxListeners = void 0);
        var o,
          h = 10;
        try {
          var a = {};
          Object.defineProperty && Object.defineProperty(a, 'x', { value: 0 }),
            (o = 0 === a.x);
        } catch (e) {
          o = !1;
        }
        function c(e) {
          return void 0 === e._maxListeners
            ? i.defaultMaxListeners
            : e._maxListeners;
        }
        function l(e, t, n, i) {
          var o, r, s;
          if ('function' != typeof n)
            throw new TypeError('"listener" argument must be a function');
          if (
            ((r = e._events)
              ? (r.newListener &&
                  (e.emit('newListener', t, n.listener ? n.listener : n),
                  (r = e._events)),
                (s = r[t]))
              : ((r = e._events = u(null)), (e._eventsCount = 0)),
            s)
          ) {
            if (
              ('function' == typeof s
                ? (s = r[t] = i ? [n, s] : [s, n])
                : i
                ? s.unshift(n)
                : s.push(n),
              !s.warned && (o = c(e)) && 0 < o && s.length > o)
            ) {
              s.warned = !0;
              var h = new Error(
                'Possible EventEmitter memory leak detected. ' +
                  s.length +
                  ' "' +
                  String(t) +
                  '" listeners added. Use emitter.setMaxListeners() to increase limit.',
              );
              (h.name = 'MaxListenersExceededWarning'),
                (h.emitter = e),
                (h.type = t),
                (h.count = s.length),
                'object' == typeof console &&
                  console.warn &&
                  console.warn('%s: %s', h.name, h.message);
            }
          } else (s = r[t] = n), ++e._eventsCount;
          return e;
        }
        function f() {
          if (!this.fired)
            switch (
              (this.target.removeListener(this.type, this.wrapFn),
              (this.fired = !0),
              arguments.length)
            ) {
              case 0:
                return this.listener.call(this.target);
              case 1:
                return this.listener.call(this.target, arguments[0]);
              case 2:
                return this.listener.call(
                  this.target,
                  arguments[0],
                  arguments[1],
                );
              case 3:
                return this.listener.call(
                  this.target,
                  arguments[0],
                  arguments[1],
                  arguments[2],
                );
              default:
                for (
                  var e = new Array(arguments.length), t = 0;
                  t < e.length;
                  ++t
                )
                  e[t] = arguments[t];
                this.listener.apply(this.target, e);
            }
        }
        function p(e, t, n) {
          var i = {
              fired: !1,
              wrapFn: void 0,
              target: e,
              type: t,
              listener: n,
            },
            o = r.call(f, i);
          return (o.listener = n), (i.wrapFn = o);
        }
        function v(e, t, n) {
          var i = e._events;
          if (!i) return [];
          var o = i[t];
          return o
            ? 'function' == typeof o
              ? n
                ? [o.listener || o]
                : [o]
              : n
              ? (function (e) {
                  for (var t = new Array(e.length), n = 0; n < t.length; ++n)
                    t[n] = e[n].listener || e[n];
                  return t;
                })(o)
              : _(o, o.length)
            : [];
        }
        function m(e) {
          var t = this._events;
          if (t) {
            var n = t[e];
            if ('function' == typeof n) return 1;
            if (n) return n.length;
          }
          return 0;
        }
        function _(e, t) {
          for (var n = new Array(t), i = 0; i < t; ++i) n[i] = e[i];
          return n;
        }
        o
          ? Object.defineProperty(i, 'defaultMaxListeners', {
              enumerable: !0,
              get: function () {
                return h;
              },
              set: function (e) {
                if ('number' != typeof e || e < 0 || e != e)
                  throw new TypeError(
                    '"defaultMaxListeners" must be a positive number',
                  );
                h = e;
              },
            })
          : (i.defaultMaxListeners = h),
          (i.prototype.setMaxListeners = function (e) {
            if ('number' != typeof e || e < 0 || isNaN(e))
              throw new TypeError('"n" argument must be a positive number');
            return (this._maxListeners = e), this;
          }),
          (i.prototype.getMaxListeners = function () {
            return c(this);
          }),
          (i.prototype.emit = function (e, t, n, i) {
            var o,
              r,
              s,
              h,
              u,
              a,
              c = 'error' === e;
            if ((a = this._events)) c = c && null == a.error;
            else if (!c) return !1;
            if (c) {
              if ((1 < arguments.length && (o = t), o instanceof Error))
                throw o;
              var l = new Error('Unhandled "error" event. (' + o + ')');
              throw ((l.context = o), l);
            }
            if (!(r = a[e])) return !1;
            var f = 'function' == typeof r;
            switch ((s = arguments.length)) {
              case 1:
                !(function (e, t, n) {
                  if (t) e.call(n);
                  else
                    for (var i = e.length, o = _(e, i), r = 0; r < i; ++r)
                      o[r].call(n);
                })(r, f, this);
                break;
              case 2:
                !(function (e, t, n, i) {
                  if (t) e.call(n, i);
                  else
                    for (var o = e.length, r = _(e, o), s = 0; s < o; ++s)
                      r[s].call(n, i);
                })(r, f, this, t);
                break;
              case 3:
                !(function (e, t, n, i, o) {
                  if (t) e.call(n, i, o);
                  else
                    for (var r = e.length, s = _(e, r), h = 0; h < r; ++h)
                      s[h].call(n, i, o);
                })(r, f, this, t, n);
                break;
              case 4:
                !(function (e, t, n, i, o, r) {
                  if (t) e.call(n, i, o, r);
                  else
                    for (var s = e.length, h = _(e, s), u = 0; u < s; ++u)
                      h[u].call(n, i, o, r);
                })(r, f, this, t, n, i);
                break;
              default:
                for (h = new Array(s - 1), u = 1; u < s; u++)
                  h[u - 1] = arguments[u];
                !(function (e, t, n, i) {
                  if (t) e.apply(n, i);
                  else
                    for (var o = e.length, r = _(e, o), s = 0; s < o; ++s)
                      r[s].apply(n, i);
                })(r, f, this, h);
            }
            return !0;
          }),
          (i.prototype.on = i.prototype.addListener =
            function (e, t) {
              return l(this, e, t, !1);
            }),
          (i.prototype.prependListener = function (e, t) {
            return l(this, e, t, !0);
          }),
          (i.prototype.once = function (e, t) {
            if ('function' != typeof t)
              throw new TypeError('"listener" argument must be a function');
            return this.on(e, p(this, e, t)), this;
          }),
          (i.prototype.prependOnceListener = function (e, t) {
            if ('function' != typeof t)
              throw new TypeError('"listener" argument must be a function');
            return this.prependListener(e, p(this, e, t)), this;
          }),
          (i.prototype.removeListener = function (e, t) {
            var n, i, o, r, s;
            if ('function' != typeof t)
              throw new TypeError('"listener" argument must be a function');
            if (!(i = this._events)) return this;
            if (!(n = i[e])) return this;
            if (n === t || n.listener === t)
              0 == --this._eventsCount
                ? (this._events = u(null))
                : (delete i[e],
                  i.removeListener &&
                    this.emit('removeListener', e, n.listener || t));
            else if ('function' != typeof n) {
              for (o = -1, r = n.length - 1; 0 <= r; r--)
                if (n[r] === t || n[r].listener === t) {
                  (s = n[r].listener), (o = r);
                  break;
                }
              if (o < 0) return this;
              0 === o
                ? n.shift()
                : (function (e, t) {
                    for (
                      var n = t, i = n + 1, o = e.length;
                      i < o;
                      n += 1, i += 1
                    )
                      e[n] = e[i];
                    e.pop();
                  })(n, o),
                1 === n.length && (i[e] = n[0]),
                i.removeListener && this.emit('removeListener', e, s || t);
            }
            return this;
          }),
          (i.prototype.removeAllListeners = function (e) {
            var t, n, i;
            if (!(n = this._events)) return this;
            if (!n.removeListener)
              return (
                0 === arguments.length
                  ? ((this._events = u(null)), (this._eventsCount = 0))
                  : n[e] &&
                    (0 == --this._eventsCount
                      ? (this._events = u(null))
                      : delete n[e]),
                this
              );
            if (0 === arguments.length) {
              var o,
                r = s(n);
              for (i = 0; i < r.length; ++i)
                'removeListener' !== (o = r[i]) && this.removeAllListeners(o);
              return (
                this.removeAllListeners('removeListener'),
                (this._events = u(null)),
                (this._eventsCount = 0),
                this
              );
            }
            if ('function' == typeof (t = n[e])) this.removeListener(e, t);
            else if (t)
              for (i = t.length - 1; 0 <= i; i--) this.removeListener(e, t[i]);
            return this;
          }),
          (i.prototype.listeners = function (e) {
            return v(this, e, !0);
          }),
          (i.prototype.rawListeners = function (e) {
            return v(this, e, !1);
          }),
          (i.listenerCount = function (e, t) {
            return 'function' == typeof e.listenerCount
              ? e.listenerCount(t)
              : m.call(e, t);
          }),
          (i.prototype.listenerCount = m),
          (i.prototype.eventNames = function () {
            return 0 < this._eventsCount ? Reflect.ownKeys(this._events) : [];
          });
      },
      {},
    ],
  },
  {},
  [1],
);
