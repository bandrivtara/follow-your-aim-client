import { useEffect, useState } from "react";
import { Tag } from "antd";
import { useGetWordsListQuery } from "store/services/english";
import { ICellRendererParams } from "ag-grid-community";
import { IWordData } from "types/english.types";
import { IWordsCategory } from "types/english.types";

const RelatedWords = ({ value, data }: ICellRendererParams<IWordsCategory>) => {
  const wordData = useGetWordsListQuery();
  const [RelatedWords, setRelatedWords] = useState<IWordData[]>([]);

  useEffect(() => {
    if (!wordData?.data) return;
    const currentRelativeWords = [];
    console.log(wordData?.data, 123123, data?.id);
    for (const [wordId, word] of Object.entries(wordData.data)) {
      if (word.group === data?.id && wordId !== "id") {
        currentRelativeWords.push(word);
      }
    }
    console.log(currentRelativeWords, 333);
    setRelatedWords(currentRelativeWords);
  }, [wordData, value, data]);

  return RelatedWords.map((word) => (
    <Tag key={word.id} color="processing">
      {word.title}
    </Tag>
  ));
};

export default RelatedWords;
