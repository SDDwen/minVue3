// 位运算  
const enum ShapeFlags{
  ELEMENT = 1,
  COMPONENT_SETUP = 1 << 1,
  CHILDREN_TEXT = 1 << 2,
  CHILDREN_ARRAY = 1 << 3
}

// 修改  | 或运算符(两位为0才为0)
//  ShapeFlags.ELEMENT | ShapeFlags.CHILDREN_TEXT 即 0101
// 查找 & 与运算符（两位为1才为1）
// 比如检测是否为element类型
// if(ShapeFlags.ELEMENT & vnode.shapeFlag)