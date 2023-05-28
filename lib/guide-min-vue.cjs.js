'use strict';

const isOn = (str) => /^on[A-Z]/.test(str);
function hostPatchProps(el, key, oldPropVal, newPropVal) {
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, newPropVal);
    }
    else {
        if (newPropVal == null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, newPropVal);
        }
    }
}
// hostRemove
function hostRemove(children) {
    const parentNode = children.parentNode;
    if (parentNode) {
        parentNode.removeChild(children);
    }
}
function hostInsert(child, parent, anchor) {
    if (parent) {
        parent.insertBefore(child, anchor || null);
    }
}
function mountChildrenText(el, childText) {
    el.textContent = childText;
}

const extend = Object.assign;
function isObject(value) {
    if (value !== null && typeof value === 'object')
        return true;
}
function hasChange(value, newValue) {
    return !Object.is(value, newValue);
}
function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}
const EMPTY_OBJ = {};

let activityEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this._activity = true;
        this.deps = [];
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this._activity) {
            return this._fn();
        }
        activityEffect = this;
        shouldTrack = true;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (!this._activity)
            return;
        cleanUpEffect(this);
        this._activity = false;
    }
}
function cleanUpEffect(effect) {
    const { deps } = effect;
    deps.forEach(dep => {
        dep.delete(effect);
    });
    deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depMap = targetMap.get(target);
    if (!depMap) {
        depMap = new Map();
        targetMap.set(target, depMap);
    }
    let dep = depMap.get(key);
    if (!dep) {
        dep = new Set();
        depMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    if (dep.has(activityEffect))
        return;
    dep.add(activityEffect);
    activityEffect.deps.push(dep);
}
function trigger(target, key) {
    const depMap = targetMap.get(target);
    const dep = depMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function isTracking() {
    return !!activityEffect && shouldTrack;
}
function effect(fn, options = {}) {
    const scheduler = options.scheduler;
    const _effect = new ReactiveEffect(fn, scheduler);
    extend(_effect, options);
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    runner();
    return runner;
}

const getter = createGetter();
const setter = createSetter();
const readonlyGetter = createGetter(true);
const shallowGetter = createGetter(false, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            track(target, key);
        }
        if (key === "_is_reactive_value_" /* ReactiveFlags.REACTIVE_VALUE */) {
            return !isReadonly;
        }
        else if (key === "_is_readonly_value_" /* ReactiveFlags.READONLY_VALUE */) {
            return isReadonly;
        }
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get: getter,
    set: setter
};
const readonlyHandler = {
    get: readonlyGetter,
    set(target, key) {
        console.warn(`key ${key}不能被 set, 因为 target 是readonly`);
        return true;
    }
};
const shallowHandler = extend({}, readonlyHandler, {
    get: shallowGetter
});

// 编码过程中要观察有没有相同结构，相同结果应该抽出来封装。依次来统一代码结构
function reactive(row) {
    return createReactive(row);
}
function readonly(row) {
    return createReadonly(row);
}
function shallowReadonly(row) {
    return createShallowReadonlu(row);
}
function createActiveObj(row, baseHandler) {
    return new Proxy(row, baseHandler);
}
function createReactive(row) {
    return createActiveObj(row, mutableHandler);
}
function createReadonly(row) {
    return createActiveObj(row, readonlyHandler);
}
function createShallowReadonlu(row) {
    return createActiveObj(row, shallowHandler);
}

// emit的实现原理是通过子组件下的propsKey与emit的eventName进行配置并执行
function emit(instance, eventName, ...arg) {
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const toPropsKeyHandler = (str) => {
        return 'on' + str;
    };
    const propKey = toPropsKeyHandler(capitalize(eventName));
    const { props } = instance;
    props[propKey] && props[propKey](...arg);
}

function initProps(instance) {
    instance.props = instance.vnode.props || {};
}

const publicInstanceProxy = {
    get({ _: instance }, key) {
        const { stateSetup } = instance;
        if (hasOwn(stateSetup, key)) {
            return stateSetup[key];
        }
    }
};

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        emit: (event) => { },
        isMounted: false,
        subTree: {},
        stateSetup: {}
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance);
    // initSlot(instance)
    setupStateFullComponent(instance);
}
function setupStateFullComponent(instance) {
    const { setup } = instance.type;
    const { props, emit } = instance;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxy);
    if (typeof setup === 'function') {
        const setupResult = setup(shallowReadonly(props), { emit });
        handleStateSetup(instance, setupResult);
    }
    finishSetupComponent(instance);
}
function handleStateSetup(instance, setupResult) {
    if (isObject(setupResult)) {
        instance.stateSetup = proxyRefs(setupResult);
    }
}
function finishSetupComponent(instance) {
    const Component = instance.type;
    if (typeof (Component === null || Component === void 0 ? void 0 : Component.render) === 'function') {
        instance.render = Component.render;
    }
}
function setupEffectRender(instance, conatiner) {
    effect(() => {
        if (!instance.isMounted) {
            const subTree = (instance.subTree = instance.render.call(instance.proxy));
            instance.subTree = subTree;
            patch(null, subTree, conatiner);
            instance.isMounted = true;
        }
        else {
            const preSubTree = instance.subTree;
            const subTree = (instance.subTree = instance.render.call(instance.proxy));
            patch(preSubTree, subTree, conatiner);
        }
    });
}

function render(vnode, container) {
    patch(null, vnode, container, null);
}
/**
 *
 * @param oldVn oldVnode
 * @param newVn newVnode
 * @param container
 */
function patch(oldVn, newVn, container, anchor = null) {
    const { shapeFlag } = newVn;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(oldVn, newVn, container, anchor);
    }
    else if (shapeFlag & 2 /* ShapeFlags.COMPONENT_SETUP */) {
        processComponent(oldVn, newVn, container);
    }
}
function processElement(oldVn, newVn, container, anchor) {
    if (!oldVn) {
        mountElement(newVn, container, anchor);
    }
    else {
        patchElement(oldVn, newVn, container, anchor);
    }
}
function patchElement(oldVn, newVn, conatiner, anchor) {
    // handler prop
    const odlProps = oldVn.props || EMPTY_OBJ;
    const newProps = newVn.props || EMPTY_OBJ;
    const el = (newVn.el = oldVn.el);
    patchProps(el, odlProps, newProps);
    patchChildren(oldVn, newVn, el, anchor);
}
function patchChildren(oldVn, newVn, conatiner, anchor) {
    const preShapeFlag = oldVn.shapeFlag;
    const shapeFlag = newVn.shapeFlag;
    const { children: oldChild } = oldVn;
    const { children: newChild } = newVn;
    if (shapeFlag & 4 /* ShapeFlags.CHILDREN_TEXT */) {
        if (preShapeFlag & 8 /* ShapeFlags.CHILDREN_ARRAY */) {
            unmountChildre(oldVn.children);
        }
        if (oldChild !== newChild) {
            mountChildrenText(conatiner, newVn.children);
        }
    }
    else if (shapeFlag & 8 /* ShapeFlags.CHILDREN_ARRAY */) {
        if (preShapeFlag & 4 /* ShapeFlags.CHILDREN_TEXT */) {
            mountChildrenText(conatiner, '');
            mountChildren(newChild, conatiner);
        }
        else if (preShapeFlag & 8 /* ShapeFlags.CHILDREN_ARRAY */) {
            patchKeyedChildren(oldChild, newChild, conatiner, anchor);
        }
    }
}
function unmountChildre(childrens) {
    for (let child of childrens) {
        hostRemove(child);
    }
}
function patchProps(el, oldProps, newProps) {
    if (oldProps === newProps)
        return;
    for (let key in newProps) {
        const preProp = oldProps[key];
        const nextProp = newProps[key];
        if (preProp !== newProps) {
            hostPatchProps(el, key, preProp, nextProp);
        }
    }
    if (oldProps === EMPTY_OBJ)
        return;
    for (let key in oldProps) {
        if (!hasOwn(newProps, key)) {
            hostPatchProps(el, key, oldProps[key], null);
        }
    }
}
function mountElement(vnode, conatiner, anchor) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { props, shapeFlag, children } = vnode;
    for (const key in props) {
        hostPatchProps(el, key, null, props[key]);
    }
    if (shapeFlag & 4 /* ShapeFlags.CHILDREN_TEXT */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.CHILDREN_ARRAY */) {
        mountChildren(children, el);
    }
    hostInsert(el, conatiner, anchor);
}
function mountChildren(childrens, parentContainer) {
    for (let item of childrens) {
        patch(null, item, parentContainer, null);
    }
}
function processComponent(oldVn, newVn, container) {
    mountComponent(newVn, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupEffectRender(instance, container);
}
function patchKeyedChildren(c1, c2, container, parentAnchor) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // 左端对比
    // (ab)c - (ab)d
    while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i];
        if (!isSameVnodeType(n1, n2)) {
            break;
        }
        patch(n1, n2, container, parentAnchor);
        i++;
    }
    // 右端对比你
    // e(ab) - c(ab)
    while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        if (!isSameVnodeType(n1, n2)) {
            break;
        }
        patch(n1, n2, container, parentAnchor);
        e1--;
        e2--;
    }
    // (ab) (ab)c
    // (ab) c(ab)
    if (i > e1 && i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
            patch(null, c2[i], container, anchor);
            i++;
        }
    }
    // (ab)c (ab)
    // c(ab) (ab)
    if (i <= e1 && i > e2) {
        debugger;
        while (i <= e1) {
            hostRemove(c1[i].el);
            i++;
        }
    }
}
function isSameVnodeType(n1, n2) {
    return n1.type === n2.type && n1.props.key === n2.props.key;
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getTypeShapeFlag(type)
    };
    const { shapeFlag } = vnode;
    if (typeof children === 'string') {
        vnode.shapeFlag = shapeFlag | 4 /* ShapeFlags.CHILDREN_TEXT */;
    }
    else if (isObject(children)) {
        vnode.shapeFlag = shapeFlag | 8 /* ShapeFlags.CHILDREN_ARRAY */;
    }
    return vnode;
}
function getTypeShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.COMPONENT_SETUP */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

const h = createVnode;

class RefImpl {
    constructor(value) {
        this.dep = new Set();
        this._is_value_ref = true;
        this._rowValue = value;
        this._value = convert(value);
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (hasChange(this._rowValue, newValue)) {
            this._value = convert(newValue);
            this._rowValue = newValue;
            triggerEffect(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!(ref === null || ref === void 0 ? void 0 : ref._is_value_ref);
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

exports.createApp = createApp;
exports.h = h;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
