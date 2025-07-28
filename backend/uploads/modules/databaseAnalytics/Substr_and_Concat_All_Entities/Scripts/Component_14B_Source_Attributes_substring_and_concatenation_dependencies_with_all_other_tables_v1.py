from itertools import product
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from Settings_Component_14B import *

def main():    

    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module

    for filename in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename, 'r', encoding=encoding_var, errors=errors_var) as file:

            filename_with_extn = os.path.basename(filename)
            filename = os.path.splitext(filename_with_extn)[0]
            filename_only = filename.split(".")[-1]
            df_input = pd.read_csv(folder_path_for_input + filename_with_extn, nrows = nrows_source_var)
            
            if len(df_input) == 0:
                continue

            col_num = one
            
            column_subset_concat_details_appended = []
            column_distinct_substr_position = []

            for col_i in tqdm(df_input.columns):
                col_i_back_up_value = col_i
                tic = time.time()
                print(f"Table '{filename}' and Column '{col_i}' finding substring or concat in progress")

                if df_input[col_i].dtype == 'object':
                    for filename_other in glob.glob(os.path.join(folder_path_for_input, star_csv_var)):
                        with codecs.open(filename_other, 'r', encoding=encoding_var, errors=errors_var) as file_other: 
                            filename_other_with_extn = os.path.basename(filename_other)
                            filename_other = os.path.splitext(filename_other_with_extn)[0]
                            filename_other_table_name = filename_other.split(".")[-1]
                            if (filename_only == filename_other_table_name):
                                continue
                            else:
                                df_input_other = pd.read_csv(folder_path_for_input + filename_other_with_extn, nrows = nrows_other_source_var)

                                for col_j in (df_input_other.columns):
                                    df_joined = []
                                    if df_input_other[col_j].dtype == 'object':
                                        if col_i == col_j:
                                            df_input.rename(columns = {col_i:Dummy_var}, inplace = inplace_var)
                                            col_i = Dummy_var
                                        df_input_col_i_df = df_input[col_i].to_frame(name = col_i)
                                        df_input_col_i_df .reset_index(inplace=inplace_var)
                                        df_input_col_i_df = df_input_col_i_df.rename(columns = {'index':'Input_Source_Row_Number'})
                                        df_input_other_col_j_df = df_input_other[col_j].to_frame(name = col_j)
                                        df_joined = df_input_col_i_df.merge(df_input_other_col_j_df, how='cross')
                                        if col_i == Dummy_var:
                                            df_input.rename(columns = {col_i:col_i_back_up_value}, inplace = inplace_var)
                                            col_i = col_i_back_up_value
                                        df_joined[substring_position_var] = df_joined.apply(lambda x: str(x[col_j]).find(str(x[col_i])), axis=1)
                                        
                                        df_joined = df_joined.drop_duplicates([Input_Source_Row_Number, substring_position_var])[[Input_Source_Row_Number, substring_position_var]]
                                        column_distinct_substr_position = df_joined.groupby([substring_position_var])[substring_position_var].agg([count_var]).sort_values([count_var,substring_position_var], ascending=[False, True]).reset_index()
                                        column_distinct_substr_position.insert(0, Col1, filename_only)
                                        column_distinct_substr_position.insert(1, Col2, col_i)
                                        column_distinct_substr_position.insert(2, Col3a, filename_other_table_name)
                                        column_distinct_substr_position.insert(3, Col3b, col_j)
                                        column_distinct_substr_position.insert(5, Col6, column_distinct_substr_position[count_var] * 100 / column_distinct_substr_position[count_var].sum())
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
