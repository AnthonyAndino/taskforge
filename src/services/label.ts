import { createLabel, findAllLabels, addLabelToCard, removeLabelFromCard } from '../repositories/labelRepository.js'
import { logActivity } from '../repositories/activityLogRepository.js'
import { AppError } from '../errors/AppError.js'

export async function createNewLabel(name: string, color: string) {
    if (!name || name.trim().length === 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Label name is required')
    }
    return await createLabel(name.trim(), color || '#cccccc')
}

export async function getAllLabels() {
    return await findAllLabels()
}

export async function assignLabelToCard(cardId: string, labelId: string, actorId: string) {
    await addLabelToCard(cardId, labelId)
    await logActivity(actorId, 'label.assigned', 'card', cardId, { labelId })
}

export async function unassignLabelFromCard(cardId: string, labelId: string, actorId: string) {
    await removeLabelFromCard(cardId, labelId)
    await logActivity(actorId, 'label.unassigned', 'card', cardId, { labelId })
}
