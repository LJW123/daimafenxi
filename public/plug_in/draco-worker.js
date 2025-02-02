(() => {
  var we = Object.create;
  var C = Object.defineProperty;
  var Ie = Object.getOwnPropertyDescriptor;
  var Me = Object.getOwnPropertyNames;
  var Te = Object.getPrototypeOf,
    _e = Object.prototype.hasOwnProperty;
  var Se = (t) => C(t, '__esModule', { value: !0 });
  var Oe = (t, e) => () => (
    e || t((e = { exports: {} }).exports, e), e.exports
  );
  var Ee = (t, e, r) => {
      if ((e && typeof e == 'object') || typeof e == 'function')
        for (let o of Me(e))
          !_e.call(t, o) &&
            o !== 'default' &&
            C(t, o, {
              get: () => e[o],
              enumerable: !(r = Ie(e, o)) || r.enumerable,
            });
      return t;
    },
    Le = (t) =>
      Ee(
        Se(
          C(
            t != null ? we(Te(t)) : {},
            'default',
            t && t.__esModule && 'default' in t
              ? { get: () => t.default, enumerable: !0 }
              : { value: t, enumerable: !0 },
          ),
        ),
        t,
      );
  var se = Oe(() => {});
  var W = '3.4.3';
  function re(t, e) {
    if (!t) throw new Error(e || 'loaders.gl assertion failed.');
  }
  var g = {
      self: typeof self != 'undefined' && self,
      window: typeof window != 'undefined' && window,
      global: typeof global != 'undefined' && global,
      document: typeof document != 'undefined' && document,
    },
    At = g.self || g.window || g.global || {},
    Dt = g.window || g.self || g.global || {},
    oe = g.global || g.self || g.window || {},
    xt = g.document || {};
  var D =
      typeof process != 'object' ||
      String(process) !== '[object process]' ||
      process.browser,
    I = typeof importScripts == 'function',
    wt =
      typeof window != 'undefined' && typeof window.orientation != 'undefined',
    ae =
      typeof process != 'undefined' &&
      process.version &&
      /v([0-9]*)/.exec(process.version),
    It = (ae && parseFloat(ae[1])) || 0;
  function U(t, e = !0, r) {
    let o = r || new Set();
    if (t) {
      if (ne(t)) o.add(t);
      else if (ne(t.buffer)) o.add(t.buffer);
      else if (!ArrayBuffer.isView(t)) {
        if (e && typeof t == 'object') for (let n in t) U(t[n], e, o);
      }
    }
    return r === void 0 ? Array.from(o) : [];
  }
  function ne(t) {
    return t
      ? t instanceof ArrayBuffer ||
          (typeof MessagePort != 'undefined' && t instanceof MessagePort) ||
          (typeof ImageBitmap != 'undefined' && t instanceof ImageBitmap) ||
          (typeof OffscreenCanvas != 'undefined' &&
            t instanceof OffscreenCanvas)
      : !1;
  }
  function x() {
    let parentPort;
    try {
      eval("globalThis.parentPort = require('worker_threads').parentPort"),
        (parentPort = globalThis.parentPort);
    } catch {}
    return parentPort;
  }
  var z = new Map(),
    m = class {
      static inWorkerThread() {
        return typeof self != 'undefined' || Boolean(x());
      }
      static set onmessage(e) {
        function r(n) {
          let s = x(),
            { type: i, payload: l } = s ? n : n.data;
          e(i, l);
        }
        let o = x();
        o
          ? (o.on('message', r),
            o.on('exit', () => console.debug('Node worker closing')))
          : (globalThis.onmessage = r);
      }
      static addEventListener(e) {
        let r = z.get(e);
        r ||
          (r = (n) => {
            if (!Fe(n)) return;
            let s = x(),
              { type: i, payload: l } = s ? n : n.data;
            e(i, l);
          }),
          x()
            ? console.error('not implemented')
            : globalThis.addEventListener('message', r);
      }
      static removeEventListener(e) {
        let r = z.get(e);
        z.delete(e),
          x()
            ? console.error('not implemented')
            : globalThis.removeEventListener('message', r);
      }
      static postMessage(e, r) {
        let o = { source: 'loaders.gl', type: e, payload: r },
          n = U(r),
          s = x();
        s ? s.postMessage(o, n) : globalThis.postMessage(o, n);
      }
    };
  function Fe(t) {
    let { type: e, data: r } = t;
    return (
      e === 'message' &&
      r &&
      typeof r.source == 'string' &&
      r.source.startsWith('loaders.gl')
    );
  }
  var M = Le(se());
  var Ne = 'latest',
    Pe = typeof W != 'undefined' ? W : Ne,
    V = {};
  async function T(t, e = null, r = {}) {
    return e && (t = ie(t, e, r)), (V[t] = V[t] || ke(t)), await V[t];
  }
  function ie(t, e, r) {
    if (t.startsWith('http')) return t;
    let o = r.modules || {};
    return o[t]
      ? o[t]
      : D
      ? r.CDN
        ? (re(r.CDN.startsWith('http')), `${r.CDN}/${e}@${Pe}/dist/libs/${t}`)
        : I
        ? `../src/libs/${t}`
        : `modules/${e}/src/libs/${t}`
      : `modules/${e}/dist/libs/${t}`;
  }
  async function ke(t) {
    if (t.endsWith('wasm')) return await (await fetch(t)).arrayBuffer();
    if (!D)
      try {
        return M && M.requireFromFile && (await M.requireFromFile(t));
      } catch {
        return null;
      }
    if (I) return importScripts(t);
    let r = await (await fetch(t)).text();
    return Be(r, t);
  }
  function Be(t, e) {
    if (!D) return M.requireFromString && M.requireFromString(t, e);
    if (I) return eval.call(oe, t), null;
    let r = document.createElement('script');
    r.id = e;
    try {
      r.appendChild(document.createTextNode(t));
    } catch {
      r.text = t;
    }
    return document.body.appendChild(r), null;
  }
  var Re = 0;
  function $(t) {
    !m.inWorkerThread() ||
      (m.onmessage = async (e, r) => {
        switch (e) {
          case 'process':
            try {
              let { input: o, options: n = {}, context: s = {} } = r,
                i = await Ce({
                  loader: t,
                  arrayBuffer: o,
                  options: n,
                  context: { ...s, parse: ve },
                });
              m.postMessage('done', { result: i });
            } catch (o) {
              let n = o instanceof Error ? o.message : '';
              m.postMessage('error', { error: n });
            }
            break;
          default:
        }
      });
  }
  function ve(t, e) {
    return new Promise((r, o) => {
      let n = Re++,
        s = (l, d) => {
          if (d.id === n)
            switch (l) {
              case 'done':
                m.removeEventListener(s), r(d.result);
                break;
              case 'error':
                m.removeEventListener(s), o(d.error);
                break;
              default:
            }
        };
      m.addEventListener(s);
      let i = { id: n, input: t, options: e };
      m.postMessage('process', i);
    });
  }
  async function Ce({ loader: t, arrayBuffer: e, options: r, context: o }) {
    let n, s;
    if (t.parseSync || t.parse) (n = e), (s = t.parseSync || t.parse);
    else if (t.parseTextSync)
      (n = new TextDecoder().decode(e)), (s = t.parseTextSync);
    else throw new Error(`Could not load data with ${t.name} loader`);
    return (
      (r = {
        ...r,
        modules: (t && t.options && t.options.modules) || {},
        worker: !1,
      }),
      await s(n, { ...r }, o, t)
    );
  }
  var ce = '3.4.3';
  var We = {
      draco: {
        decoderType: typeof WebAssembly == 'object' ? 'wasm' : 'js',
        libraryPath: 'libs/',
        extraAttributes: {},
        attributeNameEntry: void 0,
      },
    },
    le = {
      name: 'Draco',
      id: D ? 'draco' : 'draco-nodejs',
      module: 'draco',
      shapes: ['mesh'],
      version: ce,
      worker: !0,
      extensions: ['drc'],
      mimeTypes: ['application/octet-stream'],
      binary: !0,
      tests: ['DRACO'],
      options: We,
    };
  function q(t) {
    let e = 1 / 0,
      r = 1 / 0,
      o = 1 / 0,
      n = -1 / 0,
      s = -1 / 0,
      i = -1 / 0,
      l = t.POSITION ? t.POSITION.value : [],
      d = l && l.length;
    for (let f = 0; f < d; f += 3) {
      let y = l[f],
        A = l[f + 1],
        w = l[f + 2];
      (e = y < e ? y : e),
        (r = A < r ? A : r),
        (o = w < o ? w : o),
        (n = y > n ? y : n),
        (s = A > s ? A : s),
        (i = w > i ? w : i);
    }
    return [
      [e, r, o],
      [n, s, i],
    ];
  }
  function de(t, e) {
    if (!t) throw new Error(e || 'loader assertion failed.');
  }
  var p = class {
    constructor(e, r) {
      de(Array.isArray(e)),
        Ue(e),
        (this.fields = e),
        (this.metadata = r || new Map());
    }
    compareTo(e) {
      if (
        this.metadata !== e.metadata ||
        this.fields.length !== e.fields.length
      )
        return !1;
      for (let r = 0; r < this.fields.length; ++r)
        if (!this.fields[r].compareTo(e.fields[r])) return !1;
      return !0;
    }
    select(...e) {
      let r = Object.create(null);
      for (let n of e) r[n] = !0;
      let o = this.fields.filter((n) => r[n.name]);
      return new p(o, this.metadata);
    }
    selectAt(...e) {
      let r = e.map((o) => this.fields[o]).filter(Boolean);
      return new p(r, this.metadata);
    }
    assign(e) {
      let r,
        o = this.metadata;
      if (e instanceof p) {
        let i = e;
        (r = i.fields), (o = ue(ue(new Map(), this.metadata), i.metadata));
      } else r = e;
      let n = Object.create(null);
      for (let i of this.fields) n[i.name] = i;
      for (let i of r) n[i.name] = i;
      let s = Object.values(n);
      return new p(s, o);
    }
  };
  function Ue(t) {
    let e = {};
    for (let r of t)
      e[r.name] && console.warn('Schema: duplicated field name', r.name, r),
        (e[r.name] = !0);
  }
  function ue(t, e) {
    return new Map([...(t || new Map()), ...(e || new Map())]);
  }
  var b = class {
    constructor(e, r, o = !1, n = new Map()) {
      (this.name = e),
        (this.type = r),
        (this.nullable = o),
        (this.metadata = n);
    }
    get typeId() {
      return this.type && this.type.typeId;
    }
    clone() {
      return new b(this.name, this.type, this.nullable, this.metadata);
    }
    compareTo(e) {
      return (
        this.name === e.name &&
        this.type === e.type &&
        this.nullable === e.nullable &&
        this.metadata === e.metadata
      );
    }
    toString() {
      return `${this.type}${this.nullable ? ', nullable' : ''}${
        this.metadata ? `, metadata: ${this.metadata}` : ''
      }`;
    }
  };
  var c;
  (function (a) {
    (a[(a.NONE = 0)] = 'NONE'),
      (a[(a.Null = 1)] = 'Null'),
      (a[(a.Int = 2)] = 'Int'),
      (a[(a.Float = 3)] = 'Float'),
      (a[(a.Binary = 4)] = 'Binary'),
      (a[(a.Utf8 = 5)] = 'Utf8'),
      (a[(a.Bool = 6)] = 'Bool'),
      (a[(a.Decimal = 7)] = 'Decimal'),
      (a[(a.Date = 8)] = 'Date'),
      (a[(a.Time = 9)] = 'Time'),
      (a[(a.Timestamp = 10)] = 'Timestamp'),
      (a[(a.Interval = 11)] = 'Interval'),
      (a[(a.List = 12)] = 'List'),
      (a[(a.Struct = 13)] = 'Struct'),
      (a[(a.Union = 14)] = 'Union'),
      (a[(a.FixedSizeBinary = 15)] = 'FixedSizeBinary'),
      (a[(a.FixedSizeList = 16)] = 'FixedSizeList'),
      (a[(a.Map = 17)] = 'Map'),
      (a[(a.Dictionary = -1)] = 'Dictionary'),
      (a[(a.Int8 = -2)] = 'Int8'),
      (a[(a.Int16 = -3)] = 'Int16'),
      (a[(a.Int32 = -4)] = 'Int32'),
      (a[(a.Int64 = -5)] = 'Int64'),
      (a[(a.Uint8 = -6)] = 'Uint8'),
      (a[(a.Uint16 = -7)] = 'Uint16'),
      (a[(a.Uint32 = -8)] = 'Uint32'),
      (a[(a.Uint64 = -9)] = 'Uint64'),
      (a[(a.Float16 = -10)] = 'Float16'),
      (a[(a.Float32 = -11)] = 'Float32'),
      (a[(a.Float64 = -12)] = 'Float64'),
      (a[(a.DateDay = -13)] = 'DateDay'),
      (a[(a.DateMillisecond = -14)] = 'DateMillisecond'),
      (a[(a.TimestampSecond = -15)] = 'TimestampSecond'),
      (a[(a.TimestampMillisecond = -16)] = 'TimestampMillisecond'),
      (a[(a.TimestampMicrosecond = -17)] = 'TimestampMicrosecond'),
      (a[(a.TimestampNanosecond = -18)] = 'TimestampNanosecond'),
      (a[(a.TimeSecond = -19)] = 'TimeSecond'),
      (a[(a.TimeMillisecond = -20)] = 'TimeMillisecond'),
      (a[(a.TimeMicrosecond = -21)] = 'TimeMicrosecond'),
      (a[(a.TimeNanosecond = -22)] = 'TimeNanosecond'),
      (a[(a.DenseUnion = -23)] = 'DenseUnion'),
      (a[(a.SparseUnion = -24)] = 'SparseUnion'),
      (a[(a.IntervalDayTime = -25)] = 'IntervalDayTime'),
      (a[(a.IntervalYearMonth = -26)] = 'IntervalYearMonth');
  })(c || (c = {}));
  var u = class {
      static isNull(e) {
        return e && e.typeId === c.Null;
      }
      static isInt(e) {
        return e && e.typeId === c.Int;
      }
      static isFloat(e) {
        return e && e.typeId === c.Float;
      }
      static isBinary(e) {
        return e && e.typeId === c.Binary;
      }
      static isUtf8(e) {
        return e && e.typeId === c.Utf8;
      }
      static isBool(e) {
        return e && e.typeId === c.Bool;
      }
      static isDecimal(e) {
        return e && e.typeId === c.Decimal;
      }
      static isDate(e) {
        return e && e.typeId === c.Date;
      }
      static isTime(e) {
        return e && e.typeId === c.Time;
      }
      static isTimestamp(e) {
        return e && e.typeId === c.Timestamp;
      }
      static isInterval(e) {
        return e && e.typeId === c.Interval;
      }
      static isList(e) {
        return e && e.typeId === c.List;
      }
      static isStruct(e) {
        return e && e.typeId === c.Struct;
      }
      static isUnion(e) {
        return e && e.typeId === c.Union;
      }
      static isFixedSizeBinary(e) {
        return e && e.typeId === c.FixedSizeBinary;
      }
      static isFixedSizeList(e) {
        return e && e.typeId === c.FixedSizeList;
      }
      static isMap(e) {
        return e && e.typeId === c.Map;
      }
      static isDictionary(e) {
        return e && e.typeId === c.Dictionary;
      }
      get typeId() {
        return c.NONE;
      }
      compareTo(e) {
        return this === e;
      }
    },
    G = class extends u {
      get typeId() {
        return c.Null;
      }
      get [Symbol.toStringTag]() {
        return 'Null';
      }
      toString() {
        return 'Null';
      }
    },
    Q = class extends u {
      get typeId() {
        return c.Bool;
      }
      get [Symbol.toStringTag]() {
        return 'Bool';
      }
      toString() {
        return 'Bool';
      }
    },
    h = class extends u {
      constructor(e, r) {
        super();
        (this.isSigned = e), (this.bitWidth = r);
      }
      get typeId() {
        return c.Int;
      }
      get [Symbol.toStringTag]() {
        return 'Int';
      }
      toString() {
        return `${this.isSigned ? 'I' : 'Ui'}nt${this.bitWidth}`;
      }
    },
    _ = class extends h {
      constructor() {
        super(!0, 8);
      }
    },
    S = class extends h {
      constructor() {
        super(!0, 16);
      }
    },
    O = class extends h {
      constructor() {
        super(!0, 32);
      }
    };
  var E = class extends h {
      constructor() {
        super(!1, 8);
      }
    },
    L = class extends h {
      constructor() {
        super(!1, 16);
      }
    },
    F = class extends h {
      constructor() {
        super(!1, 32);
      }
    };
  var me = { HALF: 16, SINGLE: 32, DOUBLE: 64 },
    N = class extends u {
      constructor(e) {
        super();
        this.precision = e;
      }
      get typeId() {
        return c.Float;
      }
      get [Symbol.toStringTag]() {
        return 'Float';
      }
      toString() {
        return `Float${this.precision}`;
      }
    };
  var P = class extends N {
      constructor() {
        super(me.SINGLE);
      }
    },
    k = class extends N {
      constructor() {
        super(me.DOUBLE);
      }
    },
    j = class extends u {
      constructor() {
        super();
      }
      get typeId() {
        return c.Binary;
      }
      toString() {
        return 'Binary';
      }
      get [Symbol.toStringTag]() {
        return 'Binary';
      }
    },
    Y = class extends u {
      get typeId() {
        return c.Utf8;
      }
      get [Symbol.toStringTag]() {
        return 'Utf8';
      }
      toString() {
        return 'Utf8';
      }
    },
    ze = { DAY: 0, MILLISECOND: 1 },
    H = class extends u {
      constructor(e) {
        super();
        this.unit = e;
      }
      get typeId() {
        return c.Date;
      }
      get [Symbol.toStringTag]() {
        return 'Date';
      }
      toString() {
        return `Date${(this.unit + 1) * 32}<${ze[this.unit]}>`;
      }
    };
  var pe = { SECOND: 1, MILLISECOND: 1e3, MICROSECOND: 1e6, NANOSECOND: 1e9 },
    J = class extends u {
      constructor(e, r) {
        super();
        (this.unit = e), (this.bitWidth = r);
      }
      get typeId() {
        return c.Time;
      }
      toString() {
        return `Time${this.bitWidth}<${pe[this.unit]}>`;
      }
      get [Symbol.toStringTag]() {
        return 'Time';
      }
    };
  var X = class extends u {
    constructor(e, r = null) {
      super();
      (this.unit = e), (this.timezone = r);
    }
    get typeId() {
      return c.Timestamp;
    }
    get [Symbol.toStringTag]() {
      return 'Timestamp';
    }
    toString() {
      return `Timestamp<${pe[this.unit]}${
        this.timezone ? `, ${this.timezone}` : ''
      }>`;
    }
  };
  var Ve = { DAY_TIME: 0, YEAR_MONTH: 1 },
    Z = class extends u {
      constructor(e) {
        super();
        this.unit = e;
      }
      get typeId() {
        return c.Interval;
      }
      get [Symbol.toStringTag]() {
        return 'Interval';
      }
      toString() {
        return `Interval<${Ve[this.unit]}>`;
      }
    };
  var B = class extends u {
      constructor(e, r) {
        super();
        (this.listSize = e), (this.children = [r]);
      }
      get typeId() {
        return c.FixedSizeList;
      }
      get valueType() {
        return this.children[0].type;
      }
      get valueField() {
        return this.children[0];
      }
      get [Symbol.toStringTag]() {
        return 'FixedSizeList';
      }
      toString() {
        return `FixedSizeList[${this.listSize}]<${this.valueType}>`;
      }
    },
    K = class extends u {
      constructor(e) {
        super();
        this.children = e;
      }
      get typeId() {
        return c.Struct;
      }
      toString() {
        return `Struct<{${this.children
          .map((e) => `${e.name}:${e.type}`)
          .join(', ')}}>`;
      }
      get [Symbol.toStringTag]() {
        return 'Struct';
      }
    };
  function fe(t) {
    switch (t.constructor) {
      case Int8Array:
        return new _();
      case Uint8Array:
        return new E();
      case Int16Array:
        return new S();
      case Uint16Array:
        return new L();
      case Int32Array:
        return new O();
      case Uint32Array:
        return new F();
      case Float32Array:
        return new P();
      case Float64Array:
        return new k();
      default:
        throw new Error('array type not supported');
    }
  }
  function ee(t, e, r) {
    let o = fe(e.value),
      n = r || ye(e);
    return new b(t, new B(e.size, new b('value', o)), !1, n);
  }
  function ye(t) {
    let e = new Map();
    return (
      'byteOffset' in t && e.set('byteOffset', t.byteOffset.toString(10)),
      'byteStride' in t && e.set('byteStride', t.byteStride.toString(10)),
      'normalized' in t && e.set('normalized', t.normalized.toString()),
      e
    );
  }
  function ge(t, e, r) {
    let o = he(e.metadata),
      n = [],
      s = rt(e.attributes);
    for (let i in t) {
      let l = t[i],
        d = be(i, l, s[i]);
      n.push(d);
    }
    if (r) {
      let i = be('indices', r);
      n.push(i);
    }
    return new p(n, o);
  }
  function rt(t) {
    let e = {};
    for (let r in t) {
      let o = t[r];
      e[o.name || 'undefined'] = o;
    }
    return e;
  }
  function be(t, e, r) {
    let o = r ? he(r.metadata) : void 0;
    return ee(t, e, o);
  }
  function he(t) {
    let e = new Map();
    for (let r in t) e.set(`${r}.string`, JSON.stringify(t[r]));
    return e;
  }
  var Ae = {
      POSITION: 'POSITION',
      NORMAL: 'NORMAL',
      COLOR: 'COLOR_0',
      TEX_COORD: 'TEXCOORD_0',
    },
    ot = {
      1: Int8Array,
      2: Uint8Array,
      3: Int16Array,
      4: Uint16Array,
      5: Int32Array,
      6: Uint32Array,
      9: Float32Array,
    },
    at = 4,
    v = class {
      constructor(e) {
        (this.draco = e),
          (this.decoder = new this.draco.Decoder()),
          (this.metadataQuerier = new this.draco.MetadataQuerier());
      }
      destroy() {
        this.draco.destroy(this.decoder),
          this.draco.destroy(this.metadataQuerier);
      }
      parseSync(e, r = {}) {
        let o = new this.draco.DecoderBuffer();
        o.Init(new Int8Array(e), e.byteLength),
          this._disableAttributeTransforms(r);
        let n = this.decoder.GetEncodedGeometryType(o),
          s =
            n === this.draco.TRIANGULAR_MESH
              ? new this.draco.Mesh()
              : new this.draco.PointCloud();
        try {
          let i;
          switch (n) {
            case this.draco.TRIANGULAR_MESH:
              i = this.decoder.DecodeBufferToMesh(o, s);
              break;
            case this.draco.POINT_CLOUD:
              i = this.decoder.DecodeBufferToPointCloud(o, s);
              break;
            default:
              throw new Error('DRACO: Unknown geometry type.');
          }
          if (!i.ok() || !s.ptr) {
            let w = `DRACO decompression failed: ${i.error_msg()}`;
            throw new Error(w);
          }
          let l = this._getDracoLoaderData(s, n, r),
            d = this._getMeshData(s, l, r),
            f = q(d.attributes),
            y = ge(d.attributes, l, d.indices);
          return {
            loader: 'draco',
            loaderData: l,
            header: { vertexCount: s.num_points(), boundingBox: f },
            ...d,
            schema: y,
          };
        } finally {
          this.draco.destroy(o), s && this.draco.destroy(s);
        }
      }
      _getDracoLoaderData(e, r, o) {
        let n = this._getTopLevelMetadata(e),
          s = this._getDracoAttributes(e, o);
        return {
          geometry_type: r,
          num_attributes: e.num_attributes(),
          num_points: e.num_points(),
          num_faces: e instanceof this.draco.Mesh ? e.num_faces() : 0,
          metadata: n,
          attributes: s,
        };
      }
      _getDracoAttributes(e, r) {
        let o = {};
        for (let n = 0; n < e.num_attributes(); n++) {
          let s = this.decoder.GetAttribute(e, n),
            i = this._getAttributeMetadata(e, n);
          o[s.unique_id()] = {
            unique_id: s.unique_id(),
            attribute_type: s.attribute_type(),
            data_type: s.data_type(),
            num_components: s.num_components(),
            byte_offset: s.byte_offset(),
            byte_stride: s.byte_stride(),
            normalized: s.normalized(),
            attribute_index: n,
            metadata: i,
          };
          let l = this._getQuantizationTransform(s, r);
          l && (o[s.unique_id()].quantization_transform = l);
          let d = this._getOctahedronTransform(s, r);
          d && (o[s.unique_id()].octahedron_transform = d);
        }
        return o;
      }
      _getMeshData(e, r, o) {
        let n = this._getMeshAttributes(r, e, o);
        if (!n.POSITION) throw new Error('DRACO: No position attribute found.');
        if (e instanceof this.draco.Mesh)
          switch (o.topology) {
            case 'triangle-strip':
              return {
                topology: 'triangle-strip',
                mode: 4,
                attributes: n,
                indices: { value: this._getTriangleStripIndices(e), size: 1 },
              };
            case 'triangle-list':
            default:
              return {
                topology: 'triangle-list',
                mode: 5,
                attributes: n,
                indices: { value: this._getTriangleListIndices(e), size: 1 },
              };
          }
        return { topology: 'point-list', mode: 0, attributes: n };
      }
      _getMeshAttributes(e, r, o) {
        let n = {};
        for (let s of Object.values(e.attributes)) {
          let i = this._deduceAttributeName(s, o);
          s.name = i;
          let { value: l, size: d } = this._getAttributeValues(r, s);
          n[i] = {
            value: l,
            size: d,
            byteOffset: s.byte_offset,
            byteStride: s.byte_stride,
            normalized: s.normalized,
          };
        }
        return n;
      }
      _getTriangleListIndices(e) {
        let o = e.num_faces() * 3,
          n = o * at,
          s = this.draco._malloc(n);
        try {
          return (
            this.decoder.GetTrianglesUInt32Array(e, n, s),
            new Uint32Array(this.draco.HEAPF32.buffer, s, o).slice()
          );
        } finally {
          this.draco._free(s);
        }
      }
      _getTriangleStripIndices(e) {
        let r = new this.draco.DracoInt32Array();
        try {
          return this.decoder.GetTriangleStripsFromMesh(e, r), it(r);
        } finally {
          this.draco.destroy(r);
        }
      }
      _getAttributeValues(e, r) {
        let o = ot[r.data_type],
          n = r.num_components,
          i = e.num_points() * n,
          l = i * o.BYTES_PER_ELEMENT,
          d = nt(this.draco, o),
          f,
          y = this.draco._malloc(l);
        try {
          let A = this.decoder.GetAttribute(e, r.attribute_index);
          this.decoder.GetAttributeDataArrayForAllPoints(e, A, d, l, y),
            (f = new o(this.draco.HEAPF32.buffer, y, i).slice());
        } finally {
          this.draco._free(y);
        }
        return { value: f, size: n };
      }
      _deduceAttributeName(e, r) {
        let o = e.unique_id;
        for (let [i, l] of Object.entries(r.extraAttributes || {}))
          if (l === o) return i;
        let n = e.attribute_type;
        for (let i in Ae) if (this.draco[i] === n) return Ae[i];
        let s = r.attributeNameEntry || 'name';
        return e.metadata[s] ? e.metadata[s].string : `CUSTOM_ATTRIBUTE_${o}`;
      }
      _getTopLevelMetadata(e) {
        let r = this.decoder.GetMetadata(e);
        return this._getDracoMetadata(r);
      }
      _getAttributeMetadata(e, r) {
        let o = this.decoder.GetAttributeMetadata(e, r);
        return this._getDracoMetadata(o);
      }
      _getDracoMetadata(e) {
        if (!e || !e.ptr) return {};
        let r = {},
          o = this.metadataQuerier.NumEntries(e);
        for (let n = 0; n < o; n++) {
          let s = this.metadataQuerier.GetEntryName(e, n);
          r[s] = this._getDracoMetadataField(e, s);
        }
        return r;
      }
      _getDracoMetadataField(e, r) {
        let o = new this.draco.DracoInt32Array();
        try {
          this.metadataQuerier.GetIntEntryArray(e, r, o);
          let n = st(o);
          return {
            int: this.metadataQuerier.GetIntEntry(e, r),
            string: this.metadataQuerier.GetStringEntry(e, r),
            double: this.metadataQuerier.GetDoubleEntry(e, r),
            intArray: n,
          };
        } finally {
          this.draco.destroy(o);
        }
      }
      _disableAttributeTransforms(e) {
        let { quantizedAttributes: r = [], octahedronAttributes: o = [] } = e,
          n = [...r, ...o];
        for (let s of n) this.decoder.SkipAttributeTransform(this.draco[s]);
      }
      _getQuantizationTransform(e, r) {
        let { quantizedAttributes: o = [] } = r,
          n = e.attribute_type();
        if (o.map((i) => this.decoder[i]).includes(n)) {
          let i = new this.draco.AttributeQuantizationTransform();
          try {
            if (i.InitFromAttribute(e))
              return {
                quantization_bits: i.quantization_bits(),
                range: i.range(),
                min_values: new Float32Array([1, 2, 3]).map((l) =>
                  i.min_value(l),
                ),
              };
          } finally {
            this.draco.destroy(i);
          }
        }
        return null;
      }
      _getOctahedronTransform(e, r) {
        let { octahedronAttributes: o = [] } = r,
          n = e.attribute_type();
        if (o.map((i) => this.decoder[i]).includes(n)) {
          let i = new this.draco.AttributeQuantizationTransform();
          try {
            if (i.InitFromAttribute(e))
              return { quantization_bits: i.quantization_bits() };
          } finally {
            this.draco.destroy(i);
          }
        }
        return null;
      }
    };
  function nt(t, e) {
    switch (e) {
      case Float32Array:
        return t.DT_FLOAT32;
      case Int8Array:
        return t.DT_INT8;
      case Int16Array:
        return t.DT_INT16;
      case Int32Array:
        return t.DT_INT32;
      case Uint8Array:
        return t.DT_UINT8;
      case Uint16Array:
        return t.DT_UINT16;
      case Uint32Array:
        return t.DT_UINT32;
      default:
        return t.DT_INVALID;
    }
  }
  function st(t) {
    let e = t.size(),
      r = new Int32Array(e);
    for (let o = 0; o < e; o++) r[o] = t.GetValue(o);
    return r;
  }
  function it(t) {
    let e = t.size(),
      r = new Int32Array(e);
    for (let o = 0; o < e; o++) r[o] = t.GetValue(o);
    return r;
  }
  var ct = '1.5.5',
    lt = '1.4.1',
    te = `https://www.gstatic.com/draco/versioned/decoders/${ct}`,
    dt = `${te}/draco_decoder.js`,
    ut = `${te}/draco_wasm_wrapper.js`,
    mt = `${te}/draco_decoder.wasm`,
    Tr = `https://raw.githubusercontent.com/google/draco/${lt}/javascript/draco_encoder.js`,
    R;
  async function De(t) {
    let e = t.modules || {};
    return (
      e.draco3d
        ? (R =
            R || e.draco3d.createDecoderModule({}).then((r) => ({ draco: r })))
        : (R = R || pt(t)),
      await R
    );
  }
  async function pt(t) {
    let e, r;
    switch (t.draco && t.draco.decoderType) {
      case 'js':
        e = await T(dt, 'draco', t);
        break;
      case 'wasm':
      default:
        [e, r] = await Promise.all([
          await T(ut, 'draco', t),
          await T(mt, 'draco', t),
        ]);
    }
    return (e = e || globalThis.DracoDecoderModule), await ft(e, r);
  }
  function ft(t, e) {
    let r = {};
    return (
      e && (r.wasmBinary = e),
      new Promise((o) => {
        t({ ...r, onModuleLoaded: (n) => o({ draco: n }) });
      })
    );
  }
  var xe = { ...le, parse: yt };
  async function yt(t, e) {
    let { draco: r } = await De(e),
      o = new v(r);
    try {
      return o.parseSync(t, e?.draco);
    } finally {
      o.destroy();
    }
  }
  $(xe);
})();
//# sourceMappingURL=draco-worker.js.map
