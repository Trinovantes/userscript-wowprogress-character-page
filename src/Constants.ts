import { Difficulty } from './services/Difficulty'
import { Metric } from './services/Metric'
import { Tier } from './services/Tier'

export const projectTitle = `${DEFINE.PRODUCT_NAME} ${DEFINE.VERSION}`
export const projectUrl = DEFINE.REPO.url

export const CURRENT_TIERS = [Tier.T31, Tier.T33]
export const DEFAULT_DIFFICULTY = Difficulty.MYTHIC
export const DEFAULT_METRIC = Metric.DPS
