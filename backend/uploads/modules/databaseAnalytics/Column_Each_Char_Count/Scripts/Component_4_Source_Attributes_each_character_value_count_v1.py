from itertools import product
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from Settings_Component_4 import *

def main():
    
    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module

    for filename in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename, 'r', encoding='utf-8', errors='ignore') as file:
            filename_with_extn = os.path.basename(filename)
            filename = os.path.splitext(filename_with_extn)[0]
            df_input = pd.read_csv(folder_path_for_input + filename_with_extn, parse_dates=True, infer_datetime_format=True, memory_map=True)
            filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn

            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

            writer = pd.ExcelWriter(filename_with_path_and_extn)

            column_distinct_val_details_appended_all_char = []
            column_distinct_val_details_all_cols = []
            for col_i in tqdm(df_input.columns):
                tic = time.time()
                print(f"Table '{filename}' and Column '{col_i}' char value count in progress")
                column_distinct_val_details_appended_all_char = report_distinct_vals(df_input, col_i, count_of_distinct_values_per_column, max_char_loop_per_columm)
                if len(column_distinct_val_details_all_cols) == 0:
                    column_distinct_val_details_all_cols = column_distinct_val_details_appended_all_char
                else:
                    if len(column_distinct_val_details_appended_all_char) != 0:
                        column_distinct_val_details_all_cols = pd.concat([column_distinct_val_details_all_cols,column_distinct_val_details_appended_all_char],ignore_index = True, copy = False)

            filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn
            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

            col_num_str = sheet_name_table
            column_distinct_val_details_all_cols.to_excel(writer, sheet_name=col_num_str)
            worksheet = writer.sheets[col_num_str]
            toc = time.time()
            
            print("Elapsed: {} s".format(round(toc - tic, 4)))
            
            workbook = xlsxwriter.Workbook()
            workbook = writer.book
            writer._save()

def report_distinct_vals(df_input, col_i, count_of_distinct_values_per_column, max_char_loop_per_columm):

    column_distinct_val_details_appended = []
    column_distinct_val_details_appended_all_char = []
    col_i_count = 0
    col_i_max_len = 0

    df_input_col_i = df_input[~df_input[col_i].isna()][[col_i]]
    df_input_col_i[col_i] = df_input[col_i].dropna().astype(str).map(len)
    col_i_max_len = df_input_col_i[col_i].max()

    col_i_count = df_input[col_i].count()

    df_input_null_count_per_column_series = df_input[[col_i]].isna().sum()
    df_input_null_count_per_column_df = pd.DataFrame([df_input_null_count_per_column_series])
    df_input_null_count_per_column_df.rename(columns={list(df_input_null_count_per_column_df)[0]: count_var}, inplace=True)
    df_input_null_count_per_column_df.insert(0, column_name_var, col_i)
    df_input_null_count_per_column_df.insert(1, position_number_var, All_var)
    df_input_null_count_per_column_df.insert(2, char_value_var, Null_var)
                
    if col_i_max_len > max_char_loop_per_columm:
        col_i_max_len = max_char_loop_per_columm

    if col_i_count > 0:
        for i in range(0, col_i_max_len, 1):
            df_input[char_value_var] = df_input[col_i].dropna().astype(str).str[i:i+1]
            column_distinct_val_details = df_input.groupby([char_value_var])[char_value_var].agg([count_var]).sort_values([count_var,char_value_var], ascending=[False, True]).reset_index()
            if len(column_distinct_val_details_appended) == 0:
                column_distinct_val_details_appended = column_distinct_val_details
            else:
                column_distinct_val_details_appended = pd.concat([column_distinct_val_details_appended, column_distinct_val_details])

            column_distinct_val_details_appended.insert(0, column_name_var, col_i)
            column_distinct_val_details_appended.insert(1, position_number_var, i + 1)
            column_distinct_val_details_appended[count_percentage_var] = column_distinct_val_details_appended[count_var] * 100 / column_distinct_val_details_appended['count'].sum()
            
            column_distinct_val_details_appended = column_distinct_val_details_appended.reset_index(drop=True)
            
            column_distinct_val_details_appended = column_distinct_val_details_appended.head(count_of_distinct_values_per_column)
            
            if len(column_distinct_val_details_appended_all_char) == 0:
                column_distinct_val_details_appended_all_char = column_distinct_val_details_appended
            else:
                column_distinct_val_details_appended_all_char = pd.concat([column_distinct_val_details_appended_all_char, column_distinct_val_details_appended],ignore_index = True, copy = False)

            if i == 0:
                column_distinct_val_details_appended_all_char = pd.concat([df_input_null_count_per_column_df, column_distinct_val_details_appended],ignore_index = True, copy = False)

            column_distinct_val_details_appended = []
    else:
        df_input_null_count_per_column_df[count_percentage_var] = df_input_null_count_per_column_df[count_var] * 100 / df_input_null_count_per_column_df[count_var].sum()
        column_distinct_val_details_appended_all_char = df_input_null_count_per_column_df
        
    return column_distinct_val_details_appended_all_char 

if __name__ == "__main__":

    main()
