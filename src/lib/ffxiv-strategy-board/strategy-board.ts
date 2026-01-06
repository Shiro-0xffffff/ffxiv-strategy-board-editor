import { uuid } from '@/lib/utils'
import { clampInt } from './utils'

export enum StrategyBoardBackground {
  None = 0x01,
  Checkered = 0x02,
  CheckeredCircleField = 0x03,
  CheckeredSquareField = 0x04,
  Gray = 0x05,
  GrayCircleField = 0x06,
  GraySquareField = 0x07,
}

export enum StrategyBoardObjectType {
  // 图形
  Text = 0x64,
  Line = 0x0c,
  Rectangle = 0x0b,

  // 符号
  SymbolCircle = 0x57,
  SymbolCross = 0x58,
  SymbolTriangle = 0x59,
  SymbolSquare = 0x5a,
  SymbolArrow = 0x5e,
  SymbolRotate = 0x67,

  // 战斗机制
  MechanicCircleAoE = 0x09,
  MechanicConeAoE = 0x0a,
  MechanicDonutAoE = 0x11,
  MechanicMovingCircleAoE = 0x7e,

  MechanicProximityAoE = 0x10,
  MechanicTargetedProximityAoE = 0x6b,
  MechanicStack = 0x0e,
  MechanicMultiHitStack = 0x6a,
  MechanicLineStack = 0x0f,
  MechanicTankbuster = 0x6c,

  MechanicRadialKnockback = 0x6d,
  MechanicLinearKnockback = 0x6e,
  MechanicGaze = 0x0d,
  MechanicRotateClockwise = 0x8b,
  MechanicRotateCounterclockwise = 0x8c,

  MechanicTower = 0x6f,
  MechanicTowerFor1 = 0x7f,
  MechanicTowerFor2 = 0x80,
  MechanicTowerFor3 = 0x81,
  MechanicTowerFor4 = 0x82,

  Targeted = 0x70,
  TargetedRed = 0x83,
  TargetedBlue = 0x84,
  TargetedPurple = 0x85,
  TargetedGreen = 0x86,

  PairedCircle = 0x87,
  PairedCross = 0x88,
  PairedTriangle = 0x8a,
  PairedSquare = 0x89,

  Buff = 0x71,
  Debuff = 0x72,

  // 职能
  RoleTank = 0x2f,
  RoleTank1 = 0x30,
  RoleTank2 = 0x31,

  RoleHealer = 0x32,
  RolePureHealer = 0x7a,
  RoleBarrierHealer = 0x7b,
  RoleHealer1 = 0x33,
  RoleHealer2 = 0x34,

  RoleDPS = 0x35,
  RoleMeleeDPS = 0x76,
  RoleRangedDPS = 0x77,
  RolePhysicalRangedDPS = 0x78,
  RoleMagicalRangedDPS = 0x79,
  RoleDPS1 = 0x36,
  RoleDPS2 = 0x37,
  RoleDPS3 = 0x38,
  RoleDPS4 = 0x39,

  // 职业
  ClassJobPLD = 0x1b,
  ClassJobWAR = 0x1d,
  ClassJobDRK = 0x26,
  ClassJobGNB = 0x2b,

  ClassJobWHM = 0x20,
  ClassJobSCH = 0x23,
  ClassJobAST = 0x27,
  ClassJobSGE = 0x2e,

  ClassJobMNK = 0x1c,
  ClassJobDRG = 0x1e,
  ClassJobNIN = 0x24,
  ClassJobSAM = 0x28,
  ClassJobRPR = 0x2d,
  ClassJobVPR = 0x65,

  ClassJobBRD = 0x1f,
  ClassJobMCH = 0x25,
  ClassJobDNC = 0x2c,
  ClassJobBLM = 0x21,
  ClassJobSMN = 0x22,
  ClassJobRDM = 0x29,
  ClassJobPCT = 0x66,
  ClassJobBLU = 0x2a,

  ClassJobGLA = 0x12,
  ClassJobMRD = 0x14,
  ClassJobCNJ = 0x17,
  ClassJobPGL = 0x13,
  ClassJobLNC = 0x15,
  ClassJobROG = 0x1a,
  ClassJobARC = 0x16,
  ClassJobTHM = 0x18,
  ClassJobACN = 0x19,

  // 敌人
  EnemySmall = 0x3c,
  EnemyMedium = 0x3e,
  EnemyLarge = 0x40,

  // 目标标记
  SignAttack1 = 0x41,
  SignAttack2 = 0x42,
  SignAttack3 = 0x43,
  SignAttack4 = 0x44,
  SignAttack5 = 0x45,
  SignAttack6 = 0x73,
  SignAttack7 = 0x74,
  SignAttack8 = 0x75,

  SignBind1 = 0x46,
  SignBind2 = 0x47,
  SignBind3 = 0x48,
  SignStop1 = 0x49,
  SignStop2 = 0x4a,

  SignSquare = 0x4b,
  SignCircle = 0x4c,
  SignCross = 0x4d,
  SignTriangle = 0x4e,

  // 场景标记
  WaymarkA = 0x4f,
  WaymarkB = 0x50,
  WaymarkC = 0x51,
  WaymarkD = 0x52,
  Waymark1 = 0x53,
  Waymark2 = 0x54,
  Waymark3 = 0x55,
  Waymark4 = 0x56,

  // 场地
  FieldCheckeredCircle = 0x04,
  FieldCheckeredSquare = 0x08,
  FieldGrayCircle = 0x7c,
  FieldGraySquare = 0x7d,
}

export const sceneWidth = 5120
export const sceneHeight = 3840

export interface StrategyBoardObjectBase {
  id: string
  type: StrategyBoardObjectType
  visible: boolean
  locked: boolean
  position: {
    x: number
    y: number
  }
}

export interface StrategyBoardCommonObject extends StrategyBoardObjectBase {
  type: Exclude<
    StrategyBoardObjectType,
    StrategyBoardObjectType.Text |
    StrategyBoardObjectType.Line |
    StrategyBoardObjectType.Rectangle |
    StrategyBoardObjectType.MechanicCircleAoE |
    StrategyBoardObjectType.MechanicConeAoE |
    StrategyBoardObjectType.MechanicDonutAoE |
    StrategyBoardObjectType.MechanicLineStack |
    StrategyBoardObjectType.MechanicLinearKnockback
  >
  size: number
  flipped?: boolean
  rotation: number
  transparency: number
}

export interface StrategyBoardTextObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.Text
  content: string
  color: {
    r: number
    g: number
    b: number
  }
}

export interface StrategyBoardLineObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.Line
  length: number
  lineWidth: number
  rotation: number
  transparency: number
  color: {
    r: number
    g: number
    b: number
  }
}

export interface StrategyBoardRectangleObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.Rectangle
  size: {
    width: number
    height: number
  }
  rotation: number
  transparency: number
  color: {
    r: number
    g: number
    b: number
  }
}

export interface StrategyBoardCircleObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicCircleAoE
  size: number
  rotation: number
  transparency: number
}

export interface StrategyBoardConeObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicConeAoE
  size: number
  flipped?: boolean
  rotation: number
  transparency: number
  arcAngle: number
}

export interface StrategyBoardArcObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicDonutAoE
  size: number
  flipped?: boolean
  rotation: number
  transparency: number
  arcAngle: number
  innerRadius: number
}

export interface StrategyBoardMechanicLineStackObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicLineStack
  size: number
  flipped?: boolean
  rotation: number
  transparency: number
  displayCount: number
}

export interface StrategyBoardMechanicLinearKnockbackObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicLinearKnockback
  size: number
  flipped?: boolean
  rotation: number
  transparency: number
  displayCount: {
    horizontal: number
    vertical: number
  }
}

export type StrategyBoardObject =
  StrategyBoardTextObject |
  StrategyBoardLineObject |
  StrategyBoardRectangleObject |
  StrategyBoardCommonObject |
  StrategyBoardCircleObject |
  StrategyBoardConeObject |
  StrategyBoardArcObject |
  StrategyBoardMechanicLineStackObject |
  StrategyBoardMechanicLinearKnockbackObject

export function normalizePosition(position: { x: number, y: number }): { x: number, y: number } {
  return {
    x: clampInt(position.x, -sceneWidth / 2, sceneWidth / 2),
    y: clampInt(position.y, -sceneHeight / 2, sceneHeight / 2),
  }
}
export function normalizeRotation(rotation: number): number {
  if (rotation > 180) return Math.round((rotation + 180) % 360 - 180)
  if (rotation < -180) return Math.round((rotation - 180) % 360 + 180)
  return Math.round(rotation)
}
export function normalizeSize(size: number): number {
  return clampInt(size, 50, 200)
}
export function normalizeRoundShapeSize(size: number): number {
  return clampInt(size, 10, 200)
}
export function normalizeWidth(width: number): number {
  return clampInt(width / 10, 16, sceneWidth / 10)
}
export function normalizeHeight(height: number): number {
  return clampInt(height / 10, 16, sceneHeight / 10)
}
export function normalizeInnerRadius(innerRadius: number): number {
  return clampInt(innerRadius, 0, 240)
}
export function normalizeLineEndPoint(position: { x: number, y: number }, rotation: number): (endPoint: { x: number, y: number }) => { x: number, y: number } {
  const topIntersectionX = position.x + (-sceneHeight / 2 - position.y) / Math.tan(rotation * Math.PI / 180)
  const bottomIntersectionX = position.x + (sceneHeight / 2 - position.y) / Math.tan(rotation * Math.PI / 180)
  const leftIntersectionY = position.y + (-sceneWidth / 2 - position.x) * Math.tan(rotation * Math.PI / 180)
  const rightIntersectionY = position.y + (sceneWidth / 2 - position.x) * Math.tan(rotation * Math.PI / 180)
  const xLowerBound = Math.max(Math.min(topIntersectionX, bottomIntersectionX), -sceneWidth / 2)
  const xUpperBound = Math.min(Math.max(topIntersectionX, bottomIntersectionX), sceneWidth / 2)
  const yLowerBound = Math.max(Math.min(leftIntersectionY, rightIntersectionY), -sceneHeight / 2)
  const yUpperBound = Math.min(Math.max(leftIntersectionY, rightIntersectionY), sceneHeight / 2)
  return ({ x, y }) => ({
    x: clampInt(x, xLowerBound, xUpperBound),
    y: clampInt(y, yLowerBound, yUpperBound),
  })
}
export function normalizeLineWidth(lineWidth: number): number {
  return clampInt(lineWidth, 2, 10)
}
export function normalizeArcAngle(arcAngle: number): number {
  if (arcAngle > 360) return Math.round(arcAngle % 360)
  if (arcAngle < 0) return Math.round(arcAngle % 360 + 360)
  return Math.round(arcAngle)
}
export function normalizeDisplayCount(displayCount: number): number {
  return clampInt(displayCount, 1, 5)
}
export function normalizeColor(color: { r: number, g: number, b: number }): { r: number, g: number, b: number } {
  return {
    r: clampInt(color.r, 0, 255),
    g: clampInt(color.g, 0, 255),
    b: clampInt(color.b, 0, 255),
  }
}
export function normalizeTransparency(transparency: number): number {
  return clampInt(transparency, 0, 100)
}

export function createObject(type: StrategyBoardObjectType, position?: { x: number, y: number }): StrategyBoardObject {

  // 图形基本信息
  const objectBase: StrategyBoardObjectBase = {
    id: uuid(),
    type,
    visible: true,
    locked: false,
    position: normalizePosition({
      x: position?.x ?? 0,
      y: position?.y ?? 0,
    }),
  }

  // 按不同图形类型区分处理
  switch (type) {

    // 文字
    case StrategyBoardObjectType.Text:
      const textObject: StrategyBoardTextObject = {
        ...objectBase,
        type,
        content: '文本',
        color: {
          r: 255,
          g: 255,
          b: 255,
        },
      }
      return textObject

    // 线
    case StrategyBoardObjectType.Line:
      const lineObject: StrategyBoardLineObject = {
        ...objectBase,
        type,
        length: 2560,
        lineWidth: 6,
        rotation: 0,
        transparency: 0,
        color: {
          r: 255,
          g: 128,
          b: 0,
        },
      }
      return lineObject

    // 矩形
    case StrategyBoardObjectType.Rectangle:
      const RectangleObject: StrategyBoardRectangleObject = {
        ...objectBase,
        type,
        size: {
          width: 1280,
          height: 1280,
        },
        rotation: 0,
        transparency: 0,
        color: {
          r: 255,
          g: 128,
          b: 0,
        },
      }
      return RectangleObject

    // 圆形 AoE
    case StrategyBoardObjectType.MechanicCircleAoE:
      const circleObject: StrategyBoardCircleObject = {
        ...objectBase,
        type,
        size: 50,
        rotation: 0,
        transparency: 0,
      }
      return circleObject

    // 扇形 AoE
    case StrategyBoardObjectType.MechanicConeAoE:
      const coneObject: StrategyBoardConeObject = {
        ...objectBase,
        type,
        size: 50,
        flipped: false,
        rotation: 0,
        transparency: 0,
        arcAngle: 90,
      }
      return coneObject

    // 环形 AoE
    case StrategyBoardObjectType.MechanicDonutAoE:
      const arcObject: StrategyBoardArcObject = {
        ...objectBase,
        type,
        size: 50,
        flipped: false,
        rotation: 0,
        transparency: 30,
        arcAngle: 360,
        innerRadius: 50,
      }
      return arcObject

    // 直线分摊伤害
    case StrategyBoardObjectType.MechanicLineStack:
      const mechanicLineStackObject: StrategyBoardMechanicLineStackObject = {
        ...objectBase,
        type,
        size: 100,
        flipped: false,
        rotation: 0,
        transparency: 0,
        displayCount: 1,
      }
      return mechanicLineStackObject

    // 单向击退
    case StrategyBoardObjectType.MechanicLinearKnockback:
      const mechanicLinearKnockbackObject: StrategyBoardMechanicLinearKnockbackObject = {
        ...objectBase,
        type,
        size: 100,
        flipped: false,
        rotation: 0,
        transparency: 0,
        displayCount: {
          horizontal: 1,
          vertical: 1,
        },
      }
      return mechanicLinearKnockbackObject

    // 其他一般图形
    default:
      const commonObject: StrategyBoardCommonObject = {
        ...objectBase,
        type,
        size: 100,
        flipped: false,
        rotation: 0,
        transparency: 0,
      }
      return commonObject
  }
}

export interface StrategyBoardScene {
  name: string
  background: StrategyBoardBackground
  objects: StrategyBoardObject[]
}
