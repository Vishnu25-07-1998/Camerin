import pandas as pd
from tqdm import tqdm, tqdm_notebook
tqdm.pandas()
from pandas import read_csv
import os, glob
import numpy as np
import math
import xlsxwriter
from pandasql import sqldf
from Settings_Component_1 import *

def main():
   folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
   count = zero_var  
   print("folder_path_for_final_output : ", folder_path_for_final_output); 
   for filename_t in glob.glob(os.path.join(folder_path_t, star_csv_var)):
      print("filename_t : ", filename_t);
      with open(filename_t, 'r') as f_t:
           count = count + 1
           filename_with_extn = os.path.basename(filename_t)
           filename = os.path.splitext(filename_with_extn)[0]

           print("reading started of file name: ", filename_t)
           df_input = read_csv(folder_path_t1 + filename_with_extn, low_memory=False,dtype=None)

           print(f"processing started for: ", Col10)
           sample_values_list =[]

           for col in df_input:
               min_num = df_input[col].astype(str).min()
               max_num = df_input[col].astype(str).max()

               if min_num == nan_var or min_num == NA_var or min_num is None or pd.isnull(min_num) or pd.isna(min_num):
                  min_num = ""
                  min_num = ""
               
               if max_num == nan_var or max_num == NA_var or max_num is None or pd.isnull(max_num) or pd.isna(max_num):
                  max_num = ""
               
               if (min_num == "" and max_num == ""):
                   sample_values_list.append("")

               if (min_num != "" and max_num == ""):
                   sample_values_list.append(min_num)

               if (min_num == "" and max_num != ""):
                   sample_values_list.append(max_num)

               if (min_num != "" and max_num != "" and min_num != max_num):
                   sample_values_list.append(str(min_num) + ", " + str(max_num))

               if (min_num == max_num and min_num != "" and max_num != ""):
                   sample_values_list.append(min_num)

           df_output = pd.DataFrame({Col2: df_input.columns})
           df_output.insert(0, Col1, filename)
           df_input_count = len(df_input)

           print(f"processing started for: ", Col3)
           df_output.insert(2, Col3,df_input.progress_apply(lambda x: 'Yes' if ((x.count() == df_input_count) and df_input_count !=0 ) else 'Source_Empty' if df_input_count ==0 else 'Default_Null' if x.count() == 0 else 'No').tolist())

           print(f"processing started for: ", Col4)
           df_output.insert(3, Col4,df_input.progress_apply(lambda x: (x.count() * 100/df_input_count)).tolist())

           for col in df_input.select_dtypes(include=[float]):

               if df_input[col].count() > 0:
                   if any(df_input[col].dropna().round() != df_input[col].dropna()) == True:
                       pass
                   else:
                       df_input[col] = df_input[col].astype(Int64_var)

           print(f"processing started for min length calculation")
           df_output_min_len = df_input.progress_apply(lambda x: x.dropna().astype(str).str.len().min()).tolist()

           print(f"processing started for max length calculation")
           df_output_max_len = df_input.progress_apply(lambda x: x.dropna().astype(str).str.len().max()).tolist()

           print(f"processing started for: ", Col5)
           for col in df_input.select_dtypes(include=[object]):
               try:
                   df_input[col] = pd.to_datetime(df_input[col])
               except ValueError:
                   pass
               except OverflowError:
                   pass

           for col in df_input.select_dtypes(include=[object]):
               if df_input[col].dtype == object_var:
                   try:
                        df_input[col] = df_input[col].apply(lambda x: pd.Period(x, freq=ms_var))

                   except ValueError:
                       pass
                   except OverflowError:
                       pass

           df_output.insert(4, Col5, df_input.progress_apply(lambda x: x.dtypes).tolist())

           print(f"processing started for: ", Col6)
           df_output.insert(5, Col6, df_output_min_len)

           print(f"processing started for: ", Col7)
           df_output.insert(6, Col7, df_output_max_len)

           print(f"processing started for: ", Col8, Col9)
           scale_list = []
           precision_list = []
           for col in df_input:
               if df_input[col].dtype == float_var and df_input[col].count() > 0:
                   scale = lambda x: (len(x)-1)
                   scale_list.append(max(df_input[col].dropna().astype(str).apply(scale)))
                   
                   precision = lambda x: (len(x.split('.')[1]))
                   precision_list.append(max(df_input[col].dropna().astype(str).apply(precision)))
                   
               else:
                   scale_list.append("")
                   precision_list.append("")

           df_output.insert(7, Col8, scale_list)
           df_output.insert(8, Col9, precision_list)
           
           print(f"processing started for: ", Col11)
           df_input_dtypes_python_substr = []
           df_output_dtypes_usual_list = []
           df_input_dtypes_python_substr = df_input.dtypes.map(lambda x: x.name[0:3])

           for i in range(len(df_input_dtypes_python_substr)):
               if (df_input_dtypes_python_substr[i] == dat_var or df_input_dtypes_python_substr[i] == per_var) and (df_output_max_len[i] > 10):
                   df_input_dtypes_python_substr[i] = df_input_dtypes_python_substr[i] + time_var

               if (df_input_dtypes_python_substr[i] == dat_var or df_input_dtypes_python_substr[i] == per_var) and (df_output_max_len[i] < 10):
                   df_input_dtypes_python_substr[i] = Possibly_Time_var

               if (df_output[Col3][i] == Source_Empty_var):
                   df_input_dtypes_python_substr[i] = Not_Applicable_var

               if (df_output[Col3][i] == Default_Null_var and df_input_dtypes_python_substr[i] == flo_var):
                   df_input_dtypes_python_substr[i] = Not_Applicable_var

           for i in range(len(df_input_dtypes_python_substr)):
               for key in convert_datatype:
                   if df_input_dtypes_python_substr[i] == key:
                       df_output_dtypes_usual_list.append(convert_datatype[key])

           df_output.insert(9, Col11, df_output_dtypes_usual_list)

           df_output.insert(10, Col10, sample_values_list)

           filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn

           filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)


           if output_file_extn == xlsx_var:
              writer = pd.ExcelWriter(filename_with_path_and_extn)
              df_output.to_excel(writer, index=False)
              writer.save()

           if output_file_extn == csv_var:
              df_output.to_csv(filename_with_path_and_extn, encoding='utf-8', index=False, mode='w',float_format='%f')
   

if __name__ == "__main__":

   main()
