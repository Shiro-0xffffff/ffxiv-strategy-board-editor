import { StrategyBoardBackground, StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'

export interface BackgroundOption {
  name: string
  image: string
}

export const backgroundOptions = new Map<StrategyBoardBackground, BackgroundOption>()

backgroundOptions.set(StrategyBoardBackground.None, { name: '无', image: '' })
backgroundOptions.set(StrategyBoardBackground.Checkered, { name: '全面格纹场地', image: '全面格纹' })
backgroundOptions.set(StrategyBoardBackground.CheckeredCircleField, { name: '圆形格纹场地', image: '圆形格纹' })
backgroundOptions.set(StrategyBoardBackground.CheckeredSquareField, { name: '方形格纹场地', image: '方形格纹' })
backgroundOptions.set(StrategyBoardBackground.Gray, { name: '全面灰底场地', image: '全面灰底' })
backgroundOptions.set(StrategyBoardBackground.GrayCircleField, { name: '圆形灰底场地', image: '圆形灰底' })
backgroundOptions.set(StrategyBoardBackground.GraySquareField, { name: '方形灰底场地', image: '方形灰底' })

export interface ObjectLibraryItem {
  name: string
  icon: string
}

export const objectLibrary = new Map<StrategyBoardObjectType, ObjectLibraryItem>()

objectLibrary.set(StrategyBoardObjectType.Text, { name: '文字', icon: '文字' })
objectLibrary.set(StrategyBoardObjectType.Line, { name: '线', icon: '线' })
objectLibrary.set(StrategyBoardObjectType.Rectangle, { name: '矩形', icon: '矩形' })

objectLibrary.set(StrategyBoardObjectType.SymbolCircle, { name: '圆圈', icon: '圆圈' })
objectLibrary.set(StrategyBoardObjectType.SymbolCross, { name: '叉号', icon: '叉号' })
objectLibrary.set(StrategyBoardObjectType.SymbolTriangle, { name: '三角', icon: '三角' })
objectLibrary.set(StrategyBoardObjectType.SymbolSquare, { name: '方块', icon: '方块' })
objectLibrary.set(StrategyBoardObjectType.SymbolArrow, { name: '箭头', icon: '箭头' })
objectLibrary.set(StrategyBoardObjectType.SymbolRotate, { name: '旋转', icon: '旋转' })

objectLibrary.set(StrategyBoardObjectType.MechanicCircleAoE, { name: '圆形AoE', icon: '圆形AoE' })
objectLibrary.set(StrategyBoardObjectType.MechanicConeAoE, { name: '扇形AoE', icon: '扇形AoE' })
objectLibrary.set(StrategyBoardObjectType.MechanicDonutAoE, { name: '环形AoE', icon: '环形AoE' })
objectLibrary.set(StrategyBoardObjectType.MechanicMovingCircleAoE, { name: '步进式AoE', icon: '步进AoE' })

objectLibrary.set(StrategyBoardObjectType.MechanicProximityAoE, { name: '距离衰减伤害', icon: '衰减' })
objectLibrary.set(StrategyBoardObjectType.MechanicTargetedProximityAoE, { name: '目标衰减伤害', icon: '核爆' })
objectLibrary.set(StrategyBoardObjectType.MechanicStack, { name: '分摊伤害', icon: '分摊' })
objectLibrary.set(StrategyBoardObjectType.MechanicMultiHitStack, { name: '连续分摊伤害', icon: '连续分摊' })
objectLibrary.set(StrategyBoardObjectType.MechanicLineStack, { name: '直线分摊伤害', icon: '直线分摊' })
objectLibrary.set(StrategyBoardObjectType.MechanicTankbuster, { name: '死刑伤害', icon: '死刑' })

objectLibrary.set(StrategyBoardObjectType.MechanicRadialKnockback, { name: '中心击退', icon: '中心击退' })
objectLibrary.set(StrategyBoardObjectType.MechanicLinearKnockback, { name: '单向击退', icon: '单向击退' })
objectLibrary.set(StrategyBoardObjectType.MechanicGaze, { name: '背对', icon: '背对' })
objectLibrary.set(StrategyBoardObjectType.MechanicRotateClockwise, { name: '顺时针旋转', icon: '顺时针旋转' })
objectLibrary.set(StrategyBoardObjectType.MechanicRotateCounterclockwise, { name: '逆时针旋转', icon: '逆时针旋转' })

objectLibrary.set(StrategyBoardObjectType.MechanicTower, { name: '塔', icon: '塔' })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor1, { name: '单人塔', icon: '1人塔' })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor2, { name: '双人塔', icon: '2人塔' })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor3, { name: '三人塔', icon: '3人塔' })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor4, { name: '四人塔', icon: '4人塔' })

objectLibrary.set(StrategyBoardObjectType.Targeted, { name: '瞄准点名标记', icon: '瞄准点名' })
objectLibrary.set(StrategyBoardObjectType.TargetedRed, { name: '点名标记（红色）', icon: '点名(红)' })
objectLibrary.set(StrategyBoardObjectType.TargetedBlue, { name: '点名标记（蓝色）', icon: '点名(蓝)' })
objectLibrary.set(StrategyBoardObjectType.TargetedPurple, { name: '点名标记（紫色）', icon: '点名(紫)' })
objectLibrary.set(StrategyBoardObjectType.TargetedGreen, { name: '点名标记（绿色）', icon: '点名(绿)' })

objectLibrary.set(StrategyBoardObjectType.PairedCircle, { name: '配对标记（圆圈）', icon: '配对(圆圈)' })
objectLibrary.set(StrategyBoardObjectType.PairedCross, { name: '配对标记（叉号）', icon: '配对(叉号)' })
objectLibrary.set(StrategyBoardObjectType.PairedTriangle, { name: '配对标记（三角）', icon: '配对(三角)' })
objectLibrary.set(StrategyBoardObjectType.PairedSquare, { name: '配对标记（方块）', icon: '配对(方块)' })

objectLibrary.set(StrategyBoardObjectType.Buff, { name: '强化状态', icon: '强化状态' })
objectLibrary.set(StrategyBoardObjectType.Debuff, { name: '弱化状态', icon: '弱化状态' })

objectLibrary.set(StrategyBoardObjectType.RoleTank, { name: '防护职业', icon: 'T' })
objectLibrary.set(StrategyBoardObjectType.RoleTank1, { name: '防护职业1', icon: 'T1' })
objectLibrary.set(StrategyBoardObjectType.RoleTank2, { name: '防护职业2', icon: 'T2' })

objectLibrary.set(StrategyBoardObjectType.RoleHealer, { name: '治疗职业', icon: 'H' })
objectLibrary.set(StrategyBoardObjectType.RolePureHealer, { name: '纯粹治疗职业', icon: '纯H' })
objectLibrary.set(StrategyBoardObjectType.RoleBarrierHealer, { name: '护罩治疗职业', icon: '盾H' })
objectLibrary.set(StrategyBoardObjectType.RoleHealer1, { name: '治疗职业1', icon: 'H1' })
objectLibrary.set(StrategyBoardObjectType.RoleHealer2, { name: '治疗职业2', icon: 'H2' })

objectLibrary.set(StrategyBoardObjectType.RoleDPS, { name: '进攻职业', icon: 'D' })
objectLibrary.set(StrategyBoardObjectType.RoleMeleeDPS, { name: '近战职业', icon: '近战' })
objectLibrary.set(StrategyBoardObjectType.RoleRangedDPS, { name: '远程职业', icon: '远程' })
objectLibrary.set(StrategyBoardObjectType.RolePhysicalRangedDPS, { name: '远程物理职业', icon: '远敏' })
objectLibrary.set(StrategyBoardObjectType.RoleMagicalRangedDPS, { name: '远程魔法职业', icon: '法系' })
objectLibrary.set(StrategyBoardObjectType.RoleDPS1, { name: '进攻职业1', icon: 'D1' })
objectLibrary.set(StrategyBoardObjectType.RoleDPS2, { name: '进攻职业2', icon: 'D2' })
objectLibrary.set(StrategyBoardObjectType.RoleDPS3, { name: '进攻职业3', icon: 'D3' })
objectLibrary.set(StrategyBoardObjectType.RoleDPS4, { name: '进攻职业4', icon: 'D4' })

objectLibrary.set(StrategyBoardObjectType.ClassJobPLD, { name: '骑士', icon: '骑' })
objectLibrary.set(StrategyBoardObjectType.ClassJobWAR, { name: '战士', icon: '战' })
objectLibrary.set(StrategyBoardObjectType.ClassJobDRK, { name: '暗黑骑士', icon: '暗' })
objectLibrary.set(StrategyBoardObjectType.ClassJobGNB, { name: '绝枪战士', icon: '枪' })

objectLibrary.set(StrategyBoardObjectType.ClassJobWHM, { name: '白魔法师', icon: '白' })
objectLibrary.set(StrategyBoardObjectType.ClassJobSCH, { name: '学者', icon: '学' })
objectLibrary.set(StrategyBoardObjectType.ClassJobAST, { name: '占星术士', icon: '占' })
objectLibrary.set(StrategyBoardObjectType.ClassJobSGE, { name: '贤者', icon: '贤' })

objectLibrary.set(StrategyBoardObjectType.ClassJobMNK, { name: '武僧', icon: '僧' })
objectLibrary.set(StrategyBoardObjectType.ClassJobDRG, { name: '龙骑士', icon: '龙' })
objectLibrary.set(StrategyBoardObjectType.ClassJobNIN, { name: '忍者', icon: '忍' })
objectLibrary.set(StrategyBoardObjectType.ClassJobSAM, { name: '武士', icon: '侍' })
objectLibrary.set(StrategyBoardObjectType.ClassJobRPR, { name: '钐镰客', icon: '镰' })
objectLibrary.set(StrategyBoardObjectType.ClassJobVPR, { name: '蝰蛇剑士', icon: '蛇' })

objectLibrary.set(StrategyBoardObjectType.ClassJobBRD, { name: '吟游诗人', icon: '诗' })
objectLibrary.set(StrategyBoardObjectType.ClassJobMCH, { name: '机工士', icon: '机' })
objectLibrary.set(StrategyBoardObjectType.ClassJobDNC, { name: '舞者', icon: '舞' })
objectLibrary.set(StrategyBoardObjectType.ClassJobBLM, { name: '黑魔法师', icon: '黑' })
objectLibrary.set(StrategyBoardObjectType.ClassJobSMN, { name: '召唤师', icon: '召' })
objectLibrary.set(StrategyBoardObjectType.ClassJobRDM, { name: '赤魔法师', icon: '赤' })
objectLibrary.set(StrategyBoardObjectType.ClassJobPCT, { name: '绘灵法师', icon: '画' })
objectLibrary.set(StrategyBoardObjectType.ClassJobBLU, { name: '青魔法师', icon: '青' })

objectLibrary.set(StrategyBoardObjectType.ClassJobGLA, { name: '剑术师', icon: '剑' })
objectLibrary.set(StrategyBoardObjectType.ClassJobMRD, { name: '斧术师', icon: '斧' })
objectLibrary.set(StrategyBoardObjectType.ClassJobCNJ, { name: '幻术师', icon: '幻' })
objectLibrary.set(StrategyBoardObjectType.ClassJobPGL, { name: '格斗家', icon: '格' })
objectLibrary.set(StrategyBoardObjectType.ClassJobLNC, { name: '枪术师', icon: '枪' })
objectLibrary.set(StrategyBoardObjectType.ClassJobROG, { name: '双剑师', icon: '双' })
objectLibrary.set(StrategyBoardObjectType.ClassJobARC, { name: '弓箭手', icon: '弓' })
objectLibrary.set(StrategyBoardObjectType.ClassJobTHM, { name: '咒术师', icon: '咒' })
objectLibrary.set(StrategyBoardObjectType.ClassJobACN, { name: '秘术师', icon: '秘' })

objectLibrary.set(StrategyBoardObjectType.EnemySmall, { name: '小型敌人', icon: '敌人(小)' })
objectLibrary.set(StrategyBoardObjectType.EnemyMedium, { name: '中型敌人', icon: '敌人(中)' })
objectLibrary.set(StrategyBoardObjectType.EnemyLarge, { name: '大型敌人', icon: '敌人(大)' })

objectLibrary.set(StrategyBoardObjectType.SignAttack1, { name: '攻击1', icon: '攻击1' })
objectLibrary.set(StrategyBoardObjectType.SignAttack2, { name: '攻击2', icon: '攻击2' })
objectLibrary.set(StrategyBoardObjectType.SignAttack3, { name: '攻击3', icon: '攻击3' })
objectLibrary.set(StrategyBoardObjectType.SignAttack4, { name: '攻击4', icon: '攻击4' })
objectLibrary.set(StrategyBoardObjectType.SignAttack5, { name: '攻击5', icon: '攻击5' })
objectLibrary.set(StrategyBoardObjectType.SignAttack6, { name: '攻击6', icon: '攻击6' })
objectLibrary.set(StrategyBoardObjectType.SignAttack7, { name: '攻击7', icon: '攻击7' })
objectLibrary.set(StrategyBoardObjectType.SignAttack8, { name: '攻击8', icon: '攻击8' })

objectLibrary.set(StrategyBoardObjectType.SignBind1, { name: '止步1', icon: '止步1' })
objectLibrary.set(StrategyBoardObjectType.SignBind2, { name: '止步2', icon: '止步2' })
objectLibrary.set(StrategyBoardObjectType.SignBind3, { name: '止步3', icon: '止步3' })
objectLibrary.set(StrategyBoardObjectType.SignStop1, { name: '禁止1', icon: '禁止1' })
objectLibrary.set(StrategyBoardObjectType.SignStop2, { name: '禁止2', icon: '禁止2' })

objectLibrary.set(StrategyBoardObjectType.SignSquare, { name: '方块标记', icon: '方块标记' })
objectLibrary.set(StrategyBoardObjectType.SignCircle, { name: '圆圈标记', icon: '圆圈标记' })
objectLibrary.set(StrategyBoardObjectType.SignCross, { name: '十字标记', icon: '十字标记' })
objectLibrary.set(StrategyBoardObjectType.SignTriangle, { name: '三角标记', icon: '三角标记' })

objectLibrary.set(StrategyBoardObjectType.WaymarkA, { name: '场景标记A', icon: '标点A' })
objectLibrary.set(StrategyBoardObjectType.WaymarkB, { name: '场景标记B', icon: '标点B' })
objectLibrary.set(StrategyBoardObjectType.WaymarkC, { name: '场景标记C', icon: '标点C' })
objectLibrary.set(StrategyBoardObjectType.WaymarkD, { name: '场景标记D', icon: '标点D' })
objectLibrary.set(StrategyBoardObjectType.Waymark1, { name: '场景标记1', icon: '标点1' })
objectLibrary.set(StrategyBoardObjectType.Waymark2, { name: '场景标记2', icon: '标点2' })
objectLibrary.set(StrategyBoardObjectType.Waymark3, { name: '场景标记3', icon: '标点3' })
objectLibrary.set(StrategyBoardObjectType.Waymark4, { name: '场景标记4', icon: '标点4' })

objectLibrary.set(StrategyBoardObjectType.FieldCheckeredCircle, { name: '圆形格纹场地', icon: '场地(圆格)' })
objectLibrary.set(StrategyBoardObjectType.FieldCheckeredSquare, { name: '方形格纹场地', icon: '场地(方格)' })
objectLibrary.set(StrategyBoardObjectType.FieldGrayCircle, { name: '圆形灰底场地', icon: '场地(圆灰)' })
objectLibrary.set(StrategyBoardObjectType.FieldGraySquare, { name: '方形灰底场地', icon: '场地(方灰)' })

export interface ObjectLibraryGroup {
  name: string
  items: ObjectLibraryItem[][]
}

export const objectLibraryGroups: ObjectLibraryGroup[] = [
  {
    name: '',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.Text)!,
        objectLibrary.get(StrategyBoardObjectType.Line)!,
        objectLibrary.get(StrategyBoardObjectType.Rectangle)!,
      ],
    ],
  },
  {
    name: '符号',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.SymbolCircle)!,
        objectLibrary.get(StrategyBoardObjectType.SymbolCross)!,
        objectLibrary.get(StrategyBoardObjectType.SymbolTriangle)!,
        objectLibrary.get(StrategyBoardObjectType.SymbolSquare)!,
        objectLibrary.get(StrategyBoardObjectType.SymbolArrow)!,
        objectLibrary.get(StrategyBoardObjectType.SymbolRotate)!,
      ],
    ],
  },
  {
    name: '战斗机制',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.MechanicCircleAoE)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicConeAoE)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicDonutAoE)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicMovingCircleAoE)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.MechanicProximityAoE)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicTargetedProximityAoE)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicStack)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicMultiHitStack)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicLineStack)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicTankbuster)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.MechanicRadialKnockback)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicLinearKnockback)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicGaze)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicRotateClockwise)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicRotateCounterclockwise)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.MechanicTower)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicTowerFor1)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicTowerFor2)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicTowerFor3)!,
        objectLibrary.get(StrategyBoardObjectType.MechanicTowerFor4)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.Targeted)!,
        objectLibrary.get(StrategyBoardObjectType.TargetedRed)!,
        objectLibrary.get(StrategyBoardObjectType.TargetedBlue)!,
        objectLibrary.get(StrategyBoardObjectType.TargetedPurple)!,
        objectLibrary.get(StrategyBoardObjectType.TargetedGreen)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.PairedCircle)!,
        objectLibrary.get(StrategyBoardObjectType.PairedCross)!,
        objectLibrary.get(StrategyBoardObjectType.PairedTriangle)!,
        objectLibrary.get(StrategyBoardObjectType.PairedSquare)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.Buff)!,
        objectLibrary.get(StrategyBoardObjectType.Debuff)!,
      ],
    ],
  },
  {
    name: '职能',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.RoleTank)!,
        objectLibrary.get(StrategyBoardObjectType.RoleTank1)!,
        objectLibrary.get(StrategyBoardObjectType.RoleTank2)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.RoleHealer)!,
        objectLibrary.get(StrategyBoardObjectType.RolePureHealer)!,
        objectLibrary.get(StrategyBoardObjectType.RoleBarrierHealer)!,
        objectLibrary.get(StrategyBoardObjectType.RoleHealer1)!,
        objectLibrary.get(StrategyBoardObjectType.RoleHealer2)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.RoleDPS)!,
        objectLibrary.get(StrategyBoardObjectType.RoleMeleeDPS)!,
        objectLibrary.get(StrategyBoardObjectType.RoleRangedDPS)!,
        objectLibrary.get(StrategyBoardObjectType.RolePhysicalRangedDPS)!,
        objectLibrary.get(StrategyBoardObjectType.RoleMagicalRangedDPS)!,
        objectLibrary.get(StrategyBoardObjectType.RoleDPS1)!,
        objectLibrary.get(StrategyBoardObjectType.RoleDPS2)!,
        objectLibrary.get(StrategyBoardObjectType.RoleDPS3)!,
        objectLibrary.get(StrategyBoardObjectType.RoleDPS4)!,
      ],
    ],
  },
  {
    name: '职业',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.ClassJobPLD)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobWAR)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobDRK)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobGNB)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.ClassJobWHM)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobSCH)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobAST)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobSGE)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.ClassJobMNK)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobDRG)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobNIN)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobSAM)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobRPR)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobVPR)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.ClassJobBRD)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobMCH)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobDNC)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobBLM)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobSMN)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobRDM)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobPCT)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobBLU)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.ClassJobGLA)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobMRD)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobCNJ)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobPGL)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobLNC)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobROG)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobARC)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobTHM)!,
        objectLibrary.get(StrategyBoardObjectType.ClassJobACN)!,
      ],
    ],
  },
  {
    name: '敌人',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.EnemySmall)!,
        objectLibrary.get(StrategyBoardObjectType.EnemyMedium)!,
        objectLibrary.get(StrategyBoardObjectType.EnemyLarge)!,
      ],
    ],
  },
  {
    name: '目标标记',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.SignAttack1)!,
        objectLibrary.get(StrategyBoardObjectType.SignAttack2)!,
        objectLibrary.get(StrategyBoardObjectType.SignAttack3)!,
        objectLibrary.get(StrategyBoardObjectType.SignAttack4)!,
        objectLibrary.get(StrategyBoardObjectType.SignAttack5)!,
        objectLibrary.get(StrategyBoardObjectType.SignAttack6)!,
        objectLibrary.get(StrategyBoardObjectType.SignAttack7)!,
        objectLibrary.get(StrategyBoardObjectType.SignAttack8)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.SignBind1)!,
        objectLibrary.get(StrategyBoardObjectType.SignBind2)!,
        objectLibrary.get(StrategyBoardObjectType.SignBind3)!,
        objectLibrary.get(StrategyBoardObjectType.SignStop1)!,
        objectLibrary.get(StrategyBoardObjectType.SignStop2)!,
      ],
      [
        objectLibrary.get(StrategyBoardObjectType.SignSquare)!,
        objectLibrary.get(StrategyBoardObjectType.SignCircle)!,
        objectLibrary.get(StrategyBoardObjectType.SignCross)!,
        objectLibrary.get(StrategyBoardObjectType.SignTriangle)!,
      ],
    ],
  },
  {
    name: '场景标记',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.WaymarkA)!,
        objectLibrary.get(StrategyBoardObjectType.WaymarkB)!,
        objectLibrary.get(StrategyBoardObjectType.WaymarkC)!,
        objectLibrary.get(StrategyBoardObjectType.WaymarkD)!,
        objectLibrary.get(StrategyBoardObjectType.Waymark1)!,
        objectLibrary.get(StrategyBoardObjectType.Waymark2)!,
        objectLibrary.get(StrategyBoardObjectType.Waymark3)!,
        objectLibrary.get(StrategyBoardObjectType.Waymark4)!,
      ],
    ],
  },
  {
    name: '场地',
    items: [
      [
        objectLibrary.get(StrategyBoardObjectType.FieldCheckeredCircle)!,
        objectLibrary.get(StrategyBoardObjectType.FieldCheckeredSquare)!,
        objectLibrary.get(StrategyBoardObjectType.FieldGrayCircle)!,
        objectLibrary.get(StrategyBoardObjectType.FieldGraySquare)!,
      ],
    ],
  },
]
