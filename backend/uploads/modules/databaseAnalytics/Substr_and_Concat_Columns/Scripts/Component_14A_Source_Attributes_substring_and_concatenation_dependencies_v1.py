from itertools import product
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from Settings_Component_14A import *

def main():    

    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module

    for filename in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename, 'r', encoding=encoding_var, errors=errors_var) as file:

            filename_with_extn = os.path.basename(filename)
            filename = os.path.splitext(filename_with_extn)[0]
            filename_only = filename.split(".")[-1]
            df_input = pd.read_csv(folder_path_for_input + filename_with_extn)
            if len(df_input) == 0:
                continue

            col_num=one
            
            column_subset_concat_details_appended = []
            column_distinct_substr_position = []

            for col_i in tqdm(df_input.columns):
                tic = time.time()
                print(f"Table '{filename}' and Column '{col_i}' finding substring or concat in progress")

                for col_j in (df_input.columns):
                    if col_i != col_j:                        
                        df_input[substring_position_var] = df_input.apply(lambda x: str(x[col_j]).find(str(x[col_i])), axis=1)
                        column_distinct_substr_position = df_input.groupby([substring_position_var])[substring_position_var].agg([count_var]).sort_values([count_var,substring_position_var], ascending=[False, True]).reset_index()
                        column_distinct_substr_position.insert(0, Col1, filename_only)
                        column_distinct_substr_position.insert(1, Col2, col_i)
                        column_distinct_substr_position.insert(2, Col3, col_j)
                        column_distinct_substr_position.insert(5, Col6, column_distinct_substr_position[count_var] * 100 / column_distinct_substr_position[count_var].sum())
                        df_input.drop(substring_position_var, axis=1, inplace=inplace_var)
                        column_distinct_substr_position = column_distinct_substr_position.head(count_of_distinct_values_per_column)
                        if len(column_subset_concat_details_appended) == 0:
                            column_subset_concat_details_appended = column_distinct_substr_position
                        else:
                            column_subset_concat_details_appended = pd.concat([column_subset_concat_details_appended,column_distinct_substr_position],ignore_index = True, copy = False)

                        
                        
                toc = time.time()    
                print("Elapsed: {} s".format(round(toc - tic, 4)))
                    
            filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn        
            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

            writer = pd.ExcelWriter(filename_with_path_and_extn)
            column_subset_concat_details_appended.to_excel(writer, sheet_name=sheet_name_table)
            worksheet = writer.sheets[sheet_name_table]
        
            workbook = xlsxwriter.Workbook()
            workbook = writer.book
            writer._save()
                    

if __name__ == "__main__":
    main()
