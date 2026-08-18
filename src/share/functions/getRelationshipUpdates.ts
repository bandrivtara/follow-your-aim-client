export interface IRelationshipUpdate {
  id: string;
  relationId: string;
}

export const getRelationshipUpdates = (
  previousIds: string[],
  selectedIds: string[],
  relationId: string,
): IRelationshipUpdate[] => {
  const selectedIdsSet = new Set(selectedIds);
  const allIds = new Set([...previousIds, ...selectedIds]);

  return Array.from(allIds).map((id) => ({
    id,
    relationId: selectedIdsSet.has(id) ? relationId : "",
  }));
};

export const getRelationTitle = <T extends { id: string; title: string }>(
  id: string | undefined,
  items: T[] = [],
  emptyLabel: string,
) => {
  if (!id) return emptyLabel;
  return items.find((item) => item.id === id)?.title || `Не знайдено (${id})`;
};
