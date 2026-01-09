import { StrategyBoardBackground, StrategyBoardObjectType } from '@/lib/ffxiv-strategy-board'

export interface BackgroundOption {
  name: string
  image: string
}

export const backgroundOptions = new Map<StrategyBoardBackground, BackgroundOption>()

backgroundOptions.set(StrategyBoardBackground.None, { name: '无', image: '240003' })
backgroundOptions.set(StrategyBoardBackground.Checkered, { name: '全面格纹场地', image: '240004' })
backgroundOptions.set(StrategyBoardBackground.CheckeredCircleField, { name: '圆形格纹场地', image: '240005' })
backgroundOptions.set(StrategyBoardBackground.CheckeredSquareField, { name: '方形格纹场地', image: '240006' })
backgroundOptions.set(StrategyBoardBackground.Gray, { name: '全面灰底场地', image: '240009' })
backgroundOptions.set(StrategyBoardBackground.GrayCircleField, { name: '圆形灰底场地', image: '240010' })
backgroundOptions.set(StrategyBoardBackground.GraySquareField, { name: '方形灰底场地', image: '240011' })

export interface ObjectLibraryItem {
  name: string
  abbr: string
  icon: string
  image?: string
  baseSize: number
}

export const objectLibrary = new Map<StrategyBoardObjectType, ObjectLibraryItem>()

objectLibrary.set(StrategyBoardObjectType.Text, { name: '文字', abbr: '文字', icon: '240301', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.Line, { name: '线', abbr: '线', icon: '240305', baseSize: 2560 })
objectLibrary.set(StrategyBoardObjectType.Rectangle, { name: '矩形', abbr: '矩形', icon: '240303', baseSize: 1280 })

objectLibrary.set(StrategyBoardObjectType.SymbolCircle, { name: '圆圈', abbr: '圆圈', icon: '240026', image: '240026', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.SymbolCross, { name: '叉号', abbr: '叉号', icon: '240027', image: '240027', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.SymbolTriangle, { name: '三角', abbr: '三角', icon: '240028', image: '240028', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.SymbolSquare, { name: '方块', abbr: '方块', icon: '240029', image: '240029', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.SymbolArrow, { name: '箭头', abbr: '箭头', icon: '240030', image: '240030', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.SymbolRotate, { name: '旋转', abbr: '旋转', icon: '240031', image: '240031', baseSize: 480 })

objectLibrary.set(StrategyBoardObjectType.MechanicCircleAoE, { name: '圆形 AoE', abbr: '圆形AoE', icon: '240212', image: '240212', baseSize: 5120 })
objectLibrary.set(StrategyBoardObjectType.MechanicConeAoE, { name: '扇形 AoE', abbr: '扇形AoE', icon: '240302', image: '240212', baseSize: 5120 })
objectLibrary.set(StrategyBoardObjectType.MechanicDonutAoE, { name: '环形 AoE', abbr: '环形AoE', icon: '240304', image: '240218', baseSize: 5120 })
objectLibrary.set(StrategyBoardObjectType.MechanicMovingCircleAoE, { name: '步进式 AoE', abbr: '步进AoE', icon: '240213', image: '240213', baseSize: 1280 })

objectLibrary.set(StrategyBoardObjectType.MechanicStack, { name: '分摊伤害', abbr: '分摊', icon: '240202', image: '240202', baseSize: 1280 })
objectLibrary.set(StrategyBoardObjectType.MechanicMultiHitStack, { name: '连续分摊伤害', abbr: '连续分摊', icon: '240203', image: '240203', baseSize: 1280 })
objectLibrary.set(StrategyBoardObjectType.MechanicLineStack, { name: '直线分摊伤害', abbr: '直线分摊', icon: '240204', image: '240204', baseSize: 1280 })
objectLibrary.set(StrategyBoardObjectType.MechanicProximityAoE, { name: '距离衰减伤害', abbr: '衰减', icon: '240205', image: '240205', baseSize: 2560 })
objectLibrary.set(StrategyBoardObjectType.MechanicTargetedProximityAoE, { name: '目标衰减伤害', abbr: '核爆', icon: '240206', image: '240206', baseSize: 1280 })
objectLibrary.set(StrategyBoardObjectType.MechanicTankbuster, { name: '死刑伤害', abbr: '死刑', icon: '240207', image: '240207', baseSize: 640 })

objectLibrary.set(StrategyBoardObjectType.MechanicRadialKnockback, { name: '中心击退', abbr: '中心击退', icon: '240208', image: '240208', baseSize: 2560 })
objectLibrary.set(StrategyBoardObjectType.MechanicLinearKnockback, { name: '单向击退', abbr: '单向击退', icon: '240209', image: '240209', baseSize: 2560 })
objectLibrary.set(StrategyBoardObjectType.MechanicGaze, { name: '背对', abbr: '背对', icon: '240201', image: '240201', baseSize: 1280 })
objectLibrary.set(StrategyBoardObjectType.MechanicRotateClockwise, { name: '顺时针旋转', abbr: '顺时针旋转', icon: '240040', image: '240040', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.MechanicRotateCounterclockwise, { name: '逆时针旋转', abbr: '逆时针旋转', icon: '240041', image: '240041', baseSize: 480 })

objectLibrary.set(StrategyBoardObjectType.MechanicTower, { name: '塔', abbr: '塔', icon: '240210', image: '240210', baseSize: 640 })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor1, { name: '单人塔', abbr: '1人塔', icon: '240214', image: '240214', baseSize: 640 })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor2, { name: '双人塔', abbr: '2人塔', icon: '240215', image: '240215', baseSize: 640 })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor3, { name: '三人塔', abbr: '3人塔', icon: '240216', image: '240216', baseSize: 640 })
objectLibrary.set(StrategyBoardObjectType.MechanicTowerFor4, { name: '四人塔', abbr: '4人塔', icon: '240217', image: '240217', baseSize: 640 })

objectLibrary.set(StrategyBoardObjectType.Targeted, { name: '瞄准点名标记', abbr: '瞄准点名', icon: '240211', image: '240211', baseSize: 640 })
objectLibrary.set(StrategyBoardObjectType.TargetedRed, { name: '点名标记（红色）', abbr: '点名(红)', icon: '240032', image: '240032', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.TargetedBlue, { name: '点名标记（蓝色）', abbr: '点名(蓝)', icon: '240033', image: '240033', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.TargetedPurple, { name: '点名标记（紫色）', abbr: '点名(紫)', icon: '240034', image: '240034', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.TargetedGreen, { name: '点名标记（绿色）', abbr: '点名(绿)', icon: '240035', image: '240035', baseSize: 480 })

objectLibrary.set(StrategyBoardObjectType.PairedCircle, { name: '配对标记（圆圈）', abbr: '配对(圆圈)', icon: '240036', image: '240036', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.PairedCross, { name: '配对标记（叉号）', abbr: '配对(叉号)', icon: '240037', image: '240037', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.PairedTriangle, { name: '配对标记（三角）', abbr: '配对(三角)', icon: '240039', image: '240039', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.PairedSquare, { name: '配对标记（方块）', abbr: '配对(方块)', icon: '240038', image: '240038', baseSize: 480 })

objectLibrary.set(StrategyBoardObjectType.Buff, { name: '强化状态', abbr: '强化状态', icon: '240104', image: '240104', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.Debuff, { name: '弱化状态', abbr: '弱化状态', icon: '240105', image: '240105', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.RoleTank, { name: '防护职业', abbr: 'T', icon: '230901', image: '230901', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleTank1, { name: '防护职业 1', abbr: 'T1', icon: '230946', image: '230946', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleTank2, { name: '防护职业 2', abbr: 'T2', icon: '230947', image: '230947', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.RoleHealer, { name: '治疗职业', abbr: 'H', icon: '230902', image: '230902', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RolePureHealer, { name: '纯粹治疗职业', abbr: '纯H', icon: '230962', image: '230962', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleBarrierHealer, { name: '护罩治疗职业', abbr: '盾H', icon: '230963', image: '230963', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleHealer1, { name: '治疗职业 1', abbr: 'H1', icon: '230948', image: '230948', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleHealer2, { name: '治疗职业 2', abbr: 'H2', icon: '230949', image: '230949', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.RoleDPS, { name: '进攻职业', abbr: 'D', icon: '230903', image: '230903', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleMeleeDPS, { name: '近战职业', abbr: '近战', icon: '230954', image: '230954', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleRangedDPS, { name: '远程职业', abbr: '远程', icon: '230957', image: '230957', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RolePhysicalRangedDPS, { name: '远程物理职业', abbr: '远敏', icon: '230960', image: '230960', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleMagicalRangedDPS, { name: '远程魔法职业', abbr: '法系', icon: '230961', image: '230961', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleDPS1, { name: '进攻职业 1', abbr: 'D1', icon: '230950', image: '230950', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleDPS2, { name: '进攻职业 2', abbr: 'D2', icon: '230951', image: '230951', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleDPS3, { name: '进攻职业 3', abbr: 'D3', icon: '230952', image: '230952', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.RoleDPS4, { name: '进攻职业 4', abbr: 'D4', icon: '230953', image: '230953', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.ClassJobPLD, { name: '骑士', abbr: '骑', icon: '230922', image: '230922', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobWAR, { name: '战士', abbr: '战', icon: '230924', image: '230924', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobDRK, { name: '暗黑骑士', abbr: '暗', icon: '230935', image: '230935', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobGNB, { name: '绝枪战士', abbr: '枪', icon: '230940', image: '230940', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.ClassJobWHM, { name: '白魔法师', abbr: '白', icon: '230927', image: '230927', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobSCH, { name: '学者', abbr: '学', icon: '230931', image: '230931', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobAST, { name: '占星术士', abbr: '占', icon: '230936', image: '230936', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobSGE, { name: '贤者', abbr: '贤', icon: '230943', image: '230943', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.ClassJobMNK, { name: '武僧', abbr: '僧', icon: '230923', image: '230923', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobDRG, { name: '龙骑士', abbr: '龙', icon: '230925', image: '230925', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobNIN, { name: '忍者', abbr: '忍', icon: '230933', image: '230933', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobSAM, { name: '武士', abbr: '侍', icon: '230937', image: '230937', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobRPR, { name: '钐镰客', abbr: '镰', icon: '230942', image: '230942', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobVPR, { name: '蝰蛇剑士', abbr: '蛇', icon: '230944', image: '230944', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.ClassJobBRD, { name: '吟游诗人', abbr: '诗', icon: '230926', image: '230926', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobMCH, { name: '机工士', abbr: '机', icon: '230934', image: '230934', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobDNC, { name: '舞者', abbr: '舞', icon: '230941', image: '230941', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobBLM, { name: '黑魔法师', abbr: '黑', icon: '230928', image: '230928', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobSMN, { name: '召唤师', abbr: '召', icon: '230930', image: '230930', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobRDM, { name: '赤魔法师', abbr: '赤', icon: '230938', image: '230938', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobPCT, { name: '绘灵法师', abbr: '画', icon: '230945', image: '230945', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobBLU, { name: '青魔法师', abbr: '青', icon: '230939', image: '230939', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.ClassJobGLA, { name: '剑术师', abbr: '剑', icon: '230904', image: '230904', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobMRD, { name: '斧术师', abbr: '斧', icon: '230906', image: '230906', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobCNJ, { name: '幻术师', abbr: '幻', icon: '230909', image: '230909', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobPGL, { name: '格斗家', abbr: '格', icon: '230905', image: '230905', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobLNC, { name: '枪术师', abbr: '枪', icon: '230907', image: '230907', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobROG, { name: '双剑师', abbr: '双', icon: '230932', image: '230932', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobARC, { name: '弓箭手', abbr: '弓', icon: '230908', image: '230908', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobTHM, { name: '咒术师', abbr: '咒', icon: '230910', image: '230910', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.ClassJobACN, { name: '秘术师', abbr: '秘', icon: '230929', image: '230929', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.EnemySmall, { name: '小型敌人', abbr: '敌人(小)', icon: '240101', image: '240101', baseSize: 640 })
objectLibrary.set(StrategyBoardObjectType.EnemyMedium, { name: '中型敌人', abbr: '敌人(中)', icon: '240102', image: '240102', baseSize: 640 })
objectLibrary.set(StrategyBoardObjectType.EnemyLarge, { name: '大型敌人', abbr: '敌人(大)', icon: '240103', image: '240103', baseSize: 640 })

objectLibrary.set(StrategyBoardObjectType.SignAttack1, { name: '攻击 1', abbr: '攻击1', icon: '061201', image: '061201', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignAttack2, { name: '攻击 2', abbr: '攻击2', icon: '061202', image: '061202', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignAttack3, { name: '攻击 3', abbr: '攻击3', icon: '061203', image: '061203', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignAttack4, { name: '攻击 4', abbr: '攻击4', icon: '061204', image: '061204', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignAttack5, { name: '攻击 5', abbr: '攻击5', icon: '061205', image: '061205', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignAttack6, { name: '攻击 6', abbr: '攻击6', icon: '061206', image: '061206', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignAttack7, { name: '攻击 7', abbr: '攻击7', icon: '061207', image: '061207', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignAttack8, { name: '攻击 8', abbr: '攻击8', icon: '061208', image: '061208', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.SignBind1, { name: '止步 1', abbr: '止步1', icon: '061211', image: '061211', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignBind2, { name: '止步 2', abbr: '止步2', icon: '061212', image: '061212', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignBind3, { name: '止步 3', abbr: '止步3', icon: '061213', image: '061213', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignStop1, { name: '禁止 1', abbr: '禁止1', icon: '061221', image: '061221', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignStop2, { name: '禁止 2', abbr: '禁止2', icon: '061222', image: '061222', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.SignSquare, { name: '方块标记', abbr: '方块标记', icon: '061331', image: '061331', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignCircle, { name: '圆圈标记', abbr: '圆圈标记', icon: '061332', image: '061332', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignCross, { name: '十字标记', abbr: '十字标记', icon: '061333', image: '061333', baseSize: 320 })
objectLibrary.set(StrategyBoardObjectType.SignTriangle, { name: '三角标记', abbr: '三角标记', icon: '061334', image: '061334', baseSize: 320 })

objectLibrary.set(StrategyBoardObjectType.WaymarkA, { name: '场景标记 A', abbr: '标点A', icon: '061341', image: '061341', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.WaymarkB, { name: '场景标记 B', abbr: '标点B', icon: '061342', image: '061342', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.WaymarkC, { name: '场景标记 C', abbr: '标点C', icon: '061343', image: '061343', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.WaymarkD, { name: '场景标记 D', abbr: '标点D', icon: '061347', image: '061347', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.Waymark1, { name: '场景标记 1', abbr: '标点1', icon: '061344', image: '061344', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.Waymark2, { name: '场景标记 2', abbr: '标点2', icon: '061345', image: '061345', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.Waymark3, { name: '场景标记 3', abbr: '标点3', icon: '061346', image: '061346', baseSize: 480 })
objectLibrary.set(StrategyBoardObjectType.Waymark4, { name: '场景标记 4', abbr: '标点4', icon: '061348', image: '061348', baseSize: 480 })

objectLibrary.set(StrategyBoardObjectType.FieldCheckeredCircle, { name: '圆形格纹场地', abbr: '场地(圆格)', icon: '240001', image: '240001', baseSize: 2560 })
objectLibrary.set(StrategyBoardObjectType.FieldCheckeredSquare, { name: '方形格纹场地', abbr: '场地(方格)', icon: '240002', image: '240002', baseSize: 2560 })
objectLibrary.set(StrategyBoardObjectType.FieldGrayCircle, { name: '圆形灰底场地', abbr: '场地(圆灰)', icon: '240007', image: '240007', baseSize: 2560 })
objectLibrary.set(StrategyBoardObjectType.FieldGraySquare, { name: '方形灰底场地', abbr: '场地(方灰)', icon: '240008', image: '240008', baseSize: 2560 })

export interface ObjectLibraryGroup {
  name: string
  objectTypes: StrategyBoardObjectType[][][]
}

export const objectLibraryGroups: ObjectLibraryGroup[] = [
  {
    name: '',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.Text,
          StrategyBoardObjectType.Line,
          StrategyBoardObjectType.Rectangle,
        ],
      ],
    ],
  },
  {
    name: '符号',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.SymbolCircle,
          StrategyBoardObjectType.SymbolCross,
          StrategyBoardObjectType.SymbolTriangle,
          StrategyBoardObjectType.SymbolSquare,
        ],
        [
          StrategyBoardObjectType.SymbolArrow,
          StrategyBoardObjectType.SymbolRotate,
        ],
      ],
    ],
  },
  {
    name: '战斗机制',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.MechanicCircleAoE,
          StrategyBoardObjectType.MechanicConeAoE,
          StrategyBoardObjectType.MechanicDonutAoE,
          StrategyBoardObjectType.MechanicMovingCircleAoE,
        ],
      ],
      [
        [
          StrategyBoardObjectType.MechanicStack,
          StrategyBoardObjectType.MechanicMultiHitStack,
          StrategyBoardObjectType.MechanicLineStack,
        ],
        [
          StrategyBoardObjectType.MechanicProximityAoE,
          StrategyBoardObjectType.MechanicTargetedProximityAoE,
          StrategyBoardObjectType.MechanicTankbuster,
        ],
      ],
      [
        [
          StrategyBoardObjectType.MechanicRadialKnockback,
          StrategyBoardObjectType.MechanicLinearKnockback,
        ],
        [
          StrategyBoardObjectType.MechanicGaze,
          StrategyBoardObjectType.MechanicRotateClockwise,
          StrategyBoardObjectType.MechanicRotateCounterclockwise,
        ],
      ],
      [
        [
          StrategyBoardObjectType.MechanicTower,
        ],
        [
          StrategyBoardObjectType.MechanicTowerFor1,
          StrategyBoardObjectType.MechanicTowerFor2,
          StrategyBoardObjectType.MechanicTowerFor3,
          StrategyBoardObjectType.MechanicTowerFor4,
        ],
      ],
      [
        [
          StrategyBoardObjectType.Targeted,
        ],
        [
          StrategyBoardObjectType.TargetedRed,
          StrategyBoardObjectType.TargetedBlue,
          StrategyBoardObjectType.TargetedPurple,
          StrategyBoardObjectType.TargetedGreen,
        ],
      ],
      [
        [
          StrategyBoardObjectType.PairedCircle,
          StrategyBoardObjectType.PairedCross,
          StrategyBoardObjectType.PairedTriangle,
          StrategyBoardObjectType.PairedSquare,
        ],
      ],
      [
        [
          StrategyBoardObjectType.Buff,
          StrategyBoardObjectType.Debuff,
        ],
      ],
    ],
  },
  {
    name: '职能',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.RoleTank,
          StrategyBoardObjectType.RoleTank1,
          StrategyBoardObjectType.RoleTank2,
        ],
      ],
      [
        [
          StrategyBoardObjectType.RoleHealer,
          StrategyBoardObjectType.RolePureHealer,
          StrategyBoardObjectType.RoleBarrierHealer,
          StrategyBoardObjectType.RoleHealer1,
          StrategyBoardObjectType.RoleHealer2,
        ],
      ],
      [
        [
          StrategyBoardObjectType.RoleDPS,
          StrategyBoardObjectType.RoleMeleeDPS,
          StrategyBoardObjectType.RoleRangedDPS,
          StrategyBoardObjectType.RolePhysicalRangedDPS,
          StrategyBoardObjectType.RoleMagicalRangedDPS,
        ],
        [
          StrategyBoardObjectType.RoleDPS1,
          StrategyBoardObjectType.RoleDPS2,
          StrategyBoardObjectType.RoleDPS3,
          StrategyBoardObjectType.RoleDPS4,
        ],
      ],
    ],
  },
  {
    name: '职业',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.ClassJobPLD,
          StrategyBoardObjectType.ClassJobWAR,
          StrategyBoardObjectType.ClassJobDRK,
          StrategyBoardObjectType.ClassJobGNB,
        ],
      ],
      [
        [
          StrategyBoardObjectType.ClassJobWHM,
          StrategyBoardObjectType.ClassJobSCH,
          StrategyBoardObjectType.ClassJobAST,
          StrategyBoardObjectType.ClassJobSGE,
        ],
      ],
      [
        [
          StrategyBoardObjectType.ClassJobMNK,
          StrategyBoardObjectType.ClassJobDRG,
          StrategyBoardObjectType.ClassJobNIN,
          StrategyBoardObjectType.ClassJobSAM,
          StrategyBoardObjectType.ClassJobRPR,
          StrategyBoardObjectType.ClassJobVPR,
        ],
      ],
      [
        [
          StrategyBoardObjectType.ClassJobBRD,
          StrategyBoardObjectType.ClassJobMCH,
          StrategyBoardObjectType.ClassJobDNC,
        ],
        [
          StrategyBoardObjectType.ClassJobBLM,
          StrategyBoardObjectType.ClassJobSMN,
          StrategyBoardObjectType.ClassJobRDM,
          StrategyBoardObjectType.ClassJobPCT,
          StrategyBoardObjectType.ClassJobBLU,
        ],
      ],
      [
        [
          StrategyBoardObjectType.ClassJobGLA,
          StrategyBoardObjectType.ClassJobMRD,
          StrategyBoardObjectType.ClassJobCNJ,
        ],
        [
          StrategyBoardObjectType.ClassJobPGL,
          StrategyBoardObjectType.ClassJobLNC,
          StrategyBoardObjectType.ClassJobROG,
          StrategyBoardObjectType.ClassJobARC,
          StrategyBoardObjectType.ClassJobTHM,
          StrategyBoardObjectType.ClassJobACN,
        ],
      ],
    ],
  },
  {
    name: '敌人',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.EnemySmall,
          StrategyBoardObjectType.EnemyMedium,
          StrategyBoardObjectType.EnemyLarge,
        ],
      ],
    ],
  },
  {
    name: '目标标记',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.SignAttack1,
          StrategyBoardObjectType.SignAttack2,
          StrategyBoardObjectType.SignAttack3,
          StrategyBoardObjectType.SignAttack4,
        ],
        [
          StrategyBoardObjectType.SignAttack5,
          StrategyBoardObjectType.SignAttack6,
          StrategyBoardObjectType.SignAttack7,
          StrategyBoardObjectType.SignAttack8,
        ],
      ],
      [
        [
          StrategyBoardObjectType.SignBind1,
          StrategyBoardObjectType.SignBind2,
          StrategyBoardObjectType.SignBind3,
        ],
        [
          StrategyBoardObjectType.SignStop1,
          StrategyBoardObjectType.SignStop2,
        ],
      ],
      [
        [
          StrategyBoardObjectType.SignSquare,
          StrategyBoardObjectType.SignCircle,
          StrategyBoardObjectType.SignCross,
          StrategyBoardObjectType.SignTriangle,
        ],
      ],
    ],
  },
  {
    name: '场景标记',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.WaymarkA,
          StrategyBoardObjectType.WaymarkB,
          StrategyBoardObjectType.WaymarkC,
          StrategyBoardObjectType.WaymarkD,
        ],
        [
          StrategyBoardObjectType.Waymark1,
          StrategyBoardObjectType.Waymark2,
          StrategyBoardObjectType.Waymark3,
          StrategyBoardObjectType.Waymark4,
        ],
      ],
    ],
  },
  {
    name: '场地',
    objectTypes: [
      [
        [
          StrategyBoardObjectType.FieldCheckeredCircle,
          StrategyBoardObjectType.FieldCheckeredSquare,
          StrategyBoardObjectType.FieldGrayCircle,
          StrategyBoardObjectType.FieldGraySquare,
        ],
      ],
    ],
  },
]
