from itertools import product
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from difflib import SequenceMatcher
import io
import random
from Settings_Component_7 import *

def get_column_set_relations(filename_from,col_i, filename_all, col_j,s1, s2, set_relations_row):
    set1 = set(s1)
    set2 = set(s2)
    len_s1 = len(s1)
    len_s2 = len(s2)
    set_s1_disjoint_s2 = set1.isdisjoint(set2)
    if set_s1_disjoint_s2:
        set_s1_disjoint_s2_str = True_var
    else:
        set_s1_disjoint_s2_str = False_var

    if set_s1_disjoint_s2:
        set_s1_subset_of_s2 = False
        set_s1_subset_of_s2_str = False_var
    else:
        set_s1_subset_of_s2 = set1.issubset(set2)
        if set_s1_subset_of_s2:
            set_s1_subset_of_s2_str = True_var
        else:
            set_s1_subset_of_s2_str = False_var

    if set_s1_disjoint_s2:
        set_s2_subset_of_s1 = False
        set_s2_subset_of_s1_str = False_var
    else:
        set_s2_subset_of_s1 = set2.issubset(set1)
        if set_s2_subset_of_s1:
            set_s2_subset_of_s1_str = True_var
        else:
            set_s2_subset_of_s1_str = False_var

    if set_s1_disjoint_s2:
        set_s1_superset_of_s2 = False
        set_s1_superset_of_s2_str = False_var
    else:
        set_s1_superset_of_s2 = set1.issuperset(set2)
        if set_s1_superset_of_s2:
            set_s1_superset_of_s2_str = True_var
        else:
            set_s1_superset_of_s2_str = False_var

    if set_s1_disjoint_s2:
        set_s2_superset_of_s1 = False
        set_s2_superset_of_s1_str = False_var
    else:
        set_s2_superset_of_s1 = set2.issuperset(set1)
        if set_s2_superset_of_s1:
            set_s2_superset_of_s1_str = True_var
        else:
            set_s2_superset_of_s1_str = False_var

    if set_s1_subset_of_s2 and set_s2_subset_of_s1:
        both_set_same = True_var
    else:
        both_set_same = False_var

    if not set_s1_subset_of_s2:
        set_s1_minus_s2 = set1.difference(set2)
        len_set_s1_minus_s2 = len(set_s1_minus_s2)
        if int(len_set_s1_minus_s2) > int(n):
            set_s1_minus_s2 = f"More than {n} Values. Sample {n} Values are: {random.sample(set_s1_minus_s2, n)}"
    else:
        set_s1_minus_s2 = Not_applicable_var
        len_set_s1_minus_s2 = Not_applicable_var

    if not set_s2_subset_of_s1:
        set_s2_minus_s1 = set2.difference(set1)
        len_set_s2_minus_s1 = len(set_s2_minus_s1)
        if int(len_set_s2_minus_s1) > int(n):
            set_s2_minus_s1 = f"More than {n} Values. Sample {n} Values are: {random.sample(set_s2_minus_s1, n)}"
    else:
        set_s2_minus_s1 = Not_applicable_var
        len_set_s2_minus_s1 = Not_applicable_var

    if not set_s1_disjoint_s2:
        set_s1_intersection_s2 = set1.intersection(set2)
        len_set_s1_intersection_s2 = len(set_s1_intersection_s2)
        if int(len_set_s1_intersection_s2) > int(n):
            set_s1_intersection_s2 = f"More than {n} Values. Sample {n} Values are: {random.sample(set_s1_intersection_s2, n)}"
    else:
        set_s1_intersection_s2 = No_common_Values_var
        len_set_s1_intersection_s2 = 0

    if len_set_s1_minus_s2 == Not_applicable_var or len_s1 == 0:
        percent_set_s1_minus_s2 = Not_applicable_var
    else:
        percent_set_s1_minus_s2 = (len_set_s1_minus_s2*100)/len_s1

    if len_set_s2_minus_s1 == Not_applicable_var or len_s2 == 0:
        percent_set_s2_minus_s1 = Not_applicable_var
    else:
        percent_set_s2_minus_s1 = (len_set_s2_minus_s1*100)/len_s2
        
    if len_s1 == 0:
        percent_set_s1_intersection_s2 = Not_applicable_var
    else:
        percent_set_s1_intersection_s2 = (len_set_s1_intersection_s2*100)/len_s1
        
    if len_s2 == 0:
        percent_set_s2_intersection_s1 = Not_applicable_var
    else:
        percent_set_s2_intersection_s1 = (len_set_s1_intersection_s2*100)/len_s2
    
    set_relations_row.append([filename_from, col_i, filename_all, col_j, set_s1_subset_of_s2_str, set_s2_subset_of_s1_str, set_s1_superset_of_s2_str, set_s2_superset_of_s1_str, both_set_same, set_s1_disjoint_s2_str, len_s1, len_s2, len_set_s1_minus_s2, percent_set_s1_minus_s2, set_s1_minus_s2, len_set_s2_minus_s1, percent_set_s2_minus_s1, set_s2_minus_s1, len_set_s1_intersection_s2, percent_set_s1_intersection_s2, percent_set_s2_intersection_s1, set_s1_intersection_s2])

    return set_relations_row

def main():
    
    if group_name_for_filename_left == group_name_for_filename_right:
        folder_new_group_name = group_name_left
        new_group_name = group_name_for_filename_left
    else:
        folder_new_group_name = group_name_left + and_var + group_name_for_filename_right
        new_group_name = group_name_for_filename_left + and_var + group_name_for_filename_right

    folder_path_for_input_left = folder_main_path + project_name + folder_input_name_module + group_name_left
    folder_path_for_input_right = folder_main_path + project_name + folder_input_name_module + group_name_right
    folder_path_for_final_output = folder_main_path + project_name + folder_output_name_module

    for filename_from in tqdm(glob.glob(os.path.join(folder_path_for_input_left, star_csv_var))):
        with codecs.open(filename_from, 'r', encoding=encoding_var, errors=errors_var) as file_from:
            filename_with_extn_from = os.path.basename(filename_from)
            filename_from = os.path.splitext(filename_with_extn_from)[0]
            df_input_from = pd.read_csv(file_from, sep=',')

            set_relations_row = []
            set_relations_row_from_function = []

            for col_i in tqdm(df_input_from.columns):
                tic = time.time()
                for filename_all in tqdm(glob.glob(os.path.join(folder_path_for_input_right, star_csv_var))):
                    with codecs.open(filename_all, 'r', encoding=encoding_var, errors=errors_var) as file_all:
                        print(filename_from_var,filename_from)
                        print(filename_all_var,filename_all)
                        filename_with_extn_all = os.path.basename(filename_all)
                        filename_all = os.path.splitext(filename_with_extn_all)[0]
                        df_input_all = pd.read_csv(file_all, sep=',')

                        for col_j in tqdm(df_input_all.columns):

                            s1 = set(df_input_from[col_i].unique())
                            s2 = set(df_input_all[col_j].unique())
                            set_relations_row_from_function = get_column_set_relations(filename_from,col_i, filename_all, col_j,s1, s2, set_relations_row)

                            toc = time.time()
            print(f"Table '{filename_from}' and Column '{col_i}' corr Column Name completed")
            print("Elapsed: {} s".format(round(toc - tic, 4)))
                
            column_relation_details_pd = pd.DataFrame(set_relations_row_from_function, columns=[Column1, Column2, Column3, Column4, Column5, Column6, Column7, Column8, Column9, Column10, Column11, Column12, Column13, Column14, Column15, Column16, Column17, Column18, Column19, Column20, Column21, Column22])
            
            filename_with_extn = new_group_name + folder_output_name_module_for_filename + filename_from + output_file_extn
            
            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)
            
            writer = pd.ExcelWriter(filename_with_path_and_extn)
                
            col_num_str = sheet_name
            column_relation_details_pd.to_excel(writer, sheet_name=sheet_name)

            worksheet = writer.sheets[sheet_name]
            worksheet.freeze_panes(1, 0)
            workbook = xlsxwriter.Workbook()
            workbook = writer.book  
            writer.save()

if __name__ == "__main__":
    main()
