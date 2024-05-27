import { useEffect, useState } from "react";
import tableConfigs from "./tableConfigs";
import { IWord } from "types/english.types";
import { useGetWordsListQuery } from "store/services/english";
import { AgGridReact } from "ag-grid-react";
import { Button } from "antd";
import routes from "config/routes";
import { useNavigate } from "react-router-dom";

const WordsList = () => {
  const navigate = useNavigate();
  const { data } = useGetWordsListQuery();
  const [rowData, setRowData] = useState<IWord[]>([]);

  useEffect(() => {
    if (!data) return;
    const wordsList = [];
    for (const [wordId, wordData] of Object.entries(data)) {
      wordsList.push({ ...wordData, id: wordId });
    }

    if (data) {
      setRowData(wordsList);
    }
  }, [data]);

  return (
    <div>
      <Button onClick={() => navigate(routes.english.vocabulary.word.add)}>
        Додати слово
      </Button>
      <div className="ag-theme-material fyi-ag-theme">
        <AgGridReact
          rowHeight={30}
          rowData={rowData}
          columnDefs={tableConfigs}
        ></AgGridReact>
      </div>
    </div>
  );
};

export default WordsList;
