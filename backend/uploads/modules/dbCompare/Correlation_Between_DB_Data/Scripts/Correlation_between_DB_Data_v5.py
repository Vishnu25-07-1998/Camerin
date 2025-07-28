from itertools import product
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from difflib import SequenceMatcher
import io
from Settings_Component_Correlation_DB import *

def get_column_relations(s1, s2):
    #s1 = list(col_i)
    #s2 = list(col_j)
    #s1_upper = [x.upper() for x in s1]
    #s2_upper = [x.upper() for x in s2]
    #m = SequenceMatcher(None, s1_upper, s2_upper)
    m = SequenceMatcher(None, s1, s2)
    corr_quick_ratio_details = str(repr(m.ratio()))
    #s1_series = pd.Series(s1_upper)
    #s2_series = pd.Series(s2_upper)
    return corr_quick_ratio_details

if __name__ == "__main__":
    #folder_main_path = "C:\\Python_Code"
    #project_name = "\\Project_1"
    #group_name_left = "\\Source_Hospital"
    #group_name_right = "\\Camerin"
    #folder_input_name_module = "\\Source_Dump\\"
    #folder_output_name_module = "\\Quick_ratio_Column_Data_Compare"
    #group_name_for_filename_left = "Source_Hospital"
    #group_name_for_filename_right = "Camerin"
    #folder_input_name_module_for_filename = ".Source_Dump"
    #folder_output_name_module_for_filename = ".Quick_ratio_Column_Data_Compare."
    #output_file_extn = ".xlsx"
    #sheet_name = "Quick_ratio_Data_Compare"
    
    column_relation_details_pd = pd.DataFrame(columns=['Table_Name_From', 'Column_Name_From', 'Table_Name_To', 'Column_Name_To', 'Quick_ratio_value'])
    
    folder_new_group_name = group_name_left + "_and_" + group_name_right
    new_group_name = group_name_for_filename_left + "_and_" + group_name_for_filename_right

    folder_path_for_input_left = folder_main_path + project_name + group_name_left + folder_input_name_module
    folder_path_for_input_right = folder_main_path + project_name + group_name_right + folder_input_name_module
    folder_path_for_final_output = folder_main_path + project_name + folder_output_name_module
    

    for filename_from in tqdm(glob.glob(os.path.join(folder_path_for_input_left, '*.csv'))):
        with codecs.open(filename_from, 'r', encoding='utf-8', errors='ignore') as file_from:
            filename_with_extn_from = os.path.basename(filename_from)
            filename_from = os.path.splitext(filename_with_extn_from)[0]
            df_input_from = pd.read_csv(file_from)
            relation_details_row=[]
            tic = time.time()
            print(f"Table '{filename_from}' correlation Column Name Quick_ratio Match with data in progress")
            
            for col_i in (df_input_from.columns):
                        
                for filename_all in (glob.glob(os.path.join(folder_path_for_input_right, '*.csv'))):
                    with codecs.open(filename_all, 'r', encoding='utf-8', errors='ignore') as file_all:
                        
                        filename_with_extn_all = os.path.basename(filename_all)
                        filename_all = os.path.splitext(filename_with_extn_all)[0]
                        df_input_all = pd.read_csv(file_all)
                        
                        for col_j in (df_input_all.columns):
                            s1 = pd.Series(df_input_from[col_i])
                            s2 = pd.Series(df_input_all[col_j])
                            #s1 = col_i
                            #s2 = col_j
                            
                            column_relation = get_column_relations(s1, s2)
                            column_relation_str = str(column_relation)
                            relation_details_row.append([filename_from,col_i, filename_all, col_j, column_relation_str])
                            toc = time.time()

            print("Elapsed: {} s".format(round(toc - tic, 4)))

            filename_with_extn = folder_output_name_module_for_filename + filename_from + output_file_extn        
            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)
                    
            column_relation_details_pd = pd.DataFrame(relation_details_row,columns=['Table_Name_From', 'Column_Name_From', 'Table_Name_To', 'Column_Name_To', 'Quick_ratio_Value'])
            writer = pd.ExcelWriter(filename_with_path_and_extn)
            col_num_str=sheet_name
            column_relation_details_pd.to_excel(writer, sheet_name=sheet_name)
            worksheet = writer.sheets[sheet_name]
            workbook = xlsxwriter.Workbook()
            workbook = writer.book
            writer._save()
