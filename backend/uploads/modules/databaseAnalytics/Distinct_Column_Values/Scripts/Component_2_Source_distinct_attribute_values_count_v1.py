from itertools import product
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from Settings_Component_2 import *

def main():

    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module
    
    for filename in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename, 'r', encoding='utf-8', errors='ignore') as file:
            filename_with_extn = os.path.basename(filename)
            filename = os.path.splitext(filename_with_extn)[0]
            df_input = pd.read_csv(folder_path_for_input + filename_with_extn, parse_dates=True, infer_datetime_format=True, memory_map=True)
            col_num=1
            filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn

            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

            writer = pd.ExcelWriter(filename_with_path_and_extn)

            for col_i in tqdm(df_input.columns):
                column_distinct_val_details = []
                tic = time.time()
                column_distinct_val_details = report_distinct_vals(df_input, col_i, count_of_distinct_values_per_column)

                filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn
                filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

                col_num_str=Column_number_var + str(col_num)
                column_distinct_val_details.to_excel(writer, sheet_name=col_num_str)
                worksheet = writer.sheets[col_num_str]
                col_num=col_num + 1
                toc = time.time()
                print(f"Table '{filename}' and Column '{col_i}' distinct count in progress")
                print("Elapsed: {} s".format(round(toc - tic, 4)))
            
            workbook = xlsxwriter.Workbook()
            workbook = writer.book
            writer._save()

def report_distinct_vals(df_input, col_i, count_of_distinct_values_per_column):
    column_distinct_val_details1 = df_input.groupby([col_i])[col_i].agg([count_var]).sort_values([count_var,col_i], ascending=[False, True]).reset_index()
    df_input_null_count_per_column_series = df_input[[col_i]].isna().sum()
    df_input_null_count_per_column_df = pd.DataFrame([df_input_null_count_per_column_series])
    df_input_null_count_per_column_df.rename(columns={list(df_input_null_count_per_column_df)[0]: count_var}, inplace=True)
    df_input_null_count_per_column_df.insert(0, col_i, Count_of_Null_Values_var)
    column_distinct_val_details_spaces = column_distinct_val_details1[column_distinct_val_details1[col_i].astype(str).str.replace('\s+', '') == '']
    column_distinct_val_details_non_spaces = column_distinct_val_details1[column_distinct_val_details1[col_i].astype(str).str.replace('\s+', '') != '']
    column_distinct_val_details_appended = df_input_null_count_per_column_df._append(column_distinct_val_details_spaces)
    column_distinct_val_details_appended = column_distinct_val_details_appended._append(column_distinct_val_details_non_spaces)
    column_distinct_val_details_appended = column_distinct_val_details_appended.reset_index(drop=True)
    column_distinct_val_details_appended[count_percentage_var] = column_distinct_val_details_appended[count_var] * 100 / column_distinct_val_details_appended['count'].sum()
    return column_distinct_val_details_appended.head(count_of_distinct_values_per_column)

if __name__ == "__main__":
    main()
