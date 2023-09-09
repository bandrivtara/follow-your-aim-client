import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { api, db } from "../api";
import { ITask } from "../../types/tasks";

export const tasksFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTasksList: builder.query<ITask[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "tasks");
          const querySnapshot = await getDocs(ref);
          let tasksList: ITask[] = [];
          querySnapshot?.forEach((doc) => {
            tasksList.push({
              id: doc.id,
              ...doc.data(),
            } as ITask);
          });

          return { data: tasksList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Tasks"],
    }),

    getTask: builder.query({
      async queryFn(taskId) {
        try {
          const taskRef = doc(db, "tasks", taskId);
          const taskSnapshot = await getDoc(taskRef);
          if (taskSnapshot.exists()) {
            return {
              data: {
                id: taskSnapshot.id,
                ...taskSnapshot.data(),
              } as ITask,
            };
          }

          throw new Error("Task not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Tasks"],
    }),

    addTask: builder.mutation({
      async queryFn(taskData: ITask) {
        try {
          await addDoc(collection(db, "tasks"), taskData);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Tasks"],
    }),
    updateTask: builder.mutation({
      async queryFn(taskData) {
        try {
          await updateDoc(doc(db, "tasks", taskData.id), {
            [taskData.path]: taskData.data,
          });
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTaskQuery,
  useGetTasksListQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
} = tasksFirestoreApi;
