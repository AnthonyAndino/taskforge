import {
    createCard,
    findById,
    findCardsByListId,
    updateCard,
    deleteCard,
    moveCard,
    searchCards,
    type Card,
} from '../repositories/cardRepository.js'
import { logActivity } from '../repositories/activityLogRepository.js'
import { AppError } from '../errors/AppError.js'
import { broadcastEvent } from '../websocket.js'

export async function createCardInList(
    listId: string,
    title: string,
    description: string,
    priority: Card['priority'],
    actorId: string
) {
    const card = await createCard(listId, title, description, priority)

    await logActivity(actorId, 'card.created', 'card', card.id, {
        listId,
        title,
        priority,
    })

    broadcastEvent({ type: 'card.created', payload: card })
    return card
}

export async function getCardsByListId(listId: string) {
    return await findCardsByListId(listId)
}

export async function getCardById(id: string) {
    const card = await findById(id)
    if (!card) throw new AppError(404, 'NOT_FOUND', 'Card not found')
    return card
}

export async function updateCardById(
    id: string,
    fields: { title?: string; description?: string; priority?: Card['priority']; dueDate?: Date | null },
    actorId: string,
    expectedVersion: number
) {
    const card = await updateCard(id, fields, expectedVersion)
    if (!card) throw new AppError(409, 'CONFLICT', 'Card was modified by another user. Please reload.')

    await logActivity(actorId, 'card.updated', 'card', card.id, fields)
    broadcastEvent({ type: 'card.updated', payload: card })
    return card
}

export async function deleteCardById(id: string, actorId: string) {
    const deleted = await deleteCard(id)
    if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Card not found')

    await logActivity(actorId, 'card.deleted', 'card', id, {})
    broadcastEvent({ type: 'card.deleted', payload: { id } })
}

export async function searchCardsByQuery(query: string) {
    if (!query || query.trim().length === 0) return []
    return await searchCards(query.trim())
}

export async function moveCardToList(
    id: string,
    targetListId: string,
    newPosition: number,
    actorId: string,
    expectedVersion: number
) {
    const card = await moveCard(id, targetListId, newPosition, expectedVersion)
    if (!card) throw new AppError(409, 'CONFLICT', 'Card was modified by another user. Please reload.')

    await logActivity(actorId, 'card.moved', 'card', card.id, {
        fromListId: card.listId,
        toListId: targetListId,
        newPosition,
    })
    broadcastEvent({ type: 'card.moved', payload: card })
    return card
}
