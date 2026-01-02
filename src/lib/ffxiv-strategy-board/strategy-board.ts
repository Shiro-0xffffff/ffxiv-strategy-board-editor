
export enum StrategyBoardBackground {
  None = 'none',
  Checkered = 'checkered',
  CheckeredCircleField = 'checkered-circle-field',
  CheckeredSquareField = 'checkered-square-field',
  Gray = 'gray',
  GrayCircleField = 'gray-circle-field',
  GraySquareField = 'gray-square-field',
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
  type: StrategyBoardObjectType | number
  visible: boolean
  locked: boolean
  position: {
    x: number // 0-5120
    y: number // 0-3840
  }
}

export interface StrategyBoardCommonObject extends StrategyBoardObjectBase {
  type: Exclude<
    StrategyBoardObjectType,
    StrategyBoardObjectType.Text |
    StrategyBoardObjectType.Line |
    StrategyBoardObjectType.Rectangle |
    StrategyBoardObjectType.MechanicConeAoE |
    StrategyBoardObjectType.MechanicDonutAoE |
    StrategyBoardObjectType.MechanicLineStack |
    StrategyBoardObjectType.MechanicLinearKnockback
  >
  size: number // 50-200
  flipped?: boolean
  rotation: number // -180-180
  transparency: number // 0-100
}

export interface StrategyBoardTextObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.Text
  content: string
  color: {
    r: number // 0-255
    g: number // 0-255
    b: number // 0-255
  }
}

export interface StrategyBoardLineObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.Line
  width: number // 2-10
  endPoint: {
    x: number
    y: number
  }
  transparency: number
  color: {
    r: number
    g: number
    b: number
  }
}

export interface StrategyBoardRectangleObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.Rectangle
  width: number // 16-512
  height: number // 16-384
  rotation: number
  transparency: number
  color: {
    r: number
    g: number
    b: number
  }
}

export interface StrategyBoardConeObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicConeAoE
  size: number // 10-200
  flipped?: boolean
  rotation: number
  transparency: number
  arcAngle: number // 10-360
}

export interface StrategyBoardArcObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicDonutAoE
  size: number // 10-200
  flipped?: boolean
  rotation: number
  transparency: number
  arcAngle: number
  innerRadius: number // 0-240
}

export interface StrategyBoardMechanicLineStackObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicLineStack
  size: number
  flipped?: boolean
  rotation: number
  transparency: number
  displayCount: number // 1-5
}

export interface StrategyBoardMechanicLinearKnockbackObject extends StrategyBoardObjectBase {
  type: StrategyBoardObjectType.MechanicLinearKnockback
  size: number
  flipped?: boolean
  rotation: number
  transparency: number
  horizontalCount: number // 1-5
  verticalCount: number // 1-5
}

export type StrategyBoardObject =
  StrategyBoardTextObject |
  StrategyBoardLineObject |
  StrategyBoardRectangleObject |
  StrategyBoardCommonObject |
  StrategyBoardConeObject |
  StrategyBoardArcObject |
  StrategyBoardMechanicLineStackObject |
  StrategyBoardMechanicLinearKnockbackObject

export interface StrategyBoardScene {
  name: string
  background: StrategyBoardBackground
  objects: StrategyBoardObject[]
}
