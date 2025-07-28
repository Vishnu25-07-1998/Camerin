import codecs
import pandas as pd
import numpy as np
from itertools import chain, combinations
import glob, os
from tqdm import tqdm, tqdm_notebook
from pandas import read_csv
import time
import itertools
import xlsxwriter
from xlsxwriter import Workbook
from tqdm import tqdm
from Settings_Component_6 import *

def is_subkey(newkey,keys):
    for key in keys:

        if set(key).issubset(newkey):
            return True
    return False

def primarykey_recognition(file):
    count_of_unique_keys_found = zero
    count_of_keys_verified = zero
    stop_processing = False
    doc = pd.read_csv(file)
    num = one
    result = []
    table_length = len(doc.columns)
    while (num <= max_no_of_columns_in_unique_key and len(doc) > 0 and stop_processing is False):
        keys = list(itertools.combinations(doc.columns,num))

        if len(keys) > max_key_combinations_identified:
            stop_processing = True
            break

        for key in tqdm(keys):
            count_of_keys_verified = count_of_keys_verified + 1
            if count_of_keys_verified > max_key_combinations_to_be_checked:
                break
            
            if is_subkey(key,result):
                continue
            bools = np.array(doc.duplicated(subset=list(key)))
            if np.sum(bools) > 0:
                continue
            else:
                result.append(list(key))
                count_of_unique_keys_found = count_of_unique_keys_found + 1
                if count_of_unique_keys_found == max_no_of_unique_keys_required:
                    stop_processing = True
                    break
        num += 1
        count_of_keys_verified = zero
    count_of_unique_keys_found = zero

    return result

def main():
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module
    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
    
    for filename in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename, 'r', encoding=encoding_var, errors=errors_var) as file:
            tic = time.time()
            filename_with_extn = os.path.basename(filename)
            filename = os.path.splitext(filename_with_extn)[0]
            filename_table_name = filename.split(".")[-1]
            # filename_table_schema_name = filename.split(".")[-2]
            filename_table_schema_name = filename
            print(f"The processing of file '{filename}' in progress")
            prim_keys=[]
            prim_keys3=[]
            keys = primarykey_recognition(file)
            toc = time.time()

            filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn
            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

            prim_keys = pd.DataFrame(keys)
            if len(prim_keys) > 0:

                prim_keys.insert(0, Table_Name_with_filepath_var, filename)
                prim_keys.insert(2, Unique_Index_Number_var, range(1, 1 + len(prim_keys)))
                prim_keys3 = pd.melt(prim_keys,id_vars=[Table_Name_with_filepath_var, Unique_Index_Number_var])
                prim_keys3.rename(columns={value_var: Column_Name_var}, inplace=inplace_var)
                prim_keys3.dropna(subset=[Column_Name_var], inplace=inplace_var)
                prim_keys3=prim_keys3[[Table_Name_with_filepath_var, Unique_Index_Number_var,Column_Name_var]]
                prim_keys3=prim_keys3.sort_values(by=[Table_Name_with_filepath_var, Unique_Index_Number_var])
                
                prim_keys3.reset_index(drop=drop_var, inplace=inplace_var)

                prim_keys3.insert(1, Table_Qualifier_var, filename_table_schema_name)
                prim_keys3.insert(2, Table_Name_var, filename_table_name)
                
                writer = pd.ExcelWriter(filename_with_path_and_extn)
                prim_keys3.to_excel(writer, sheet_name=Sheet2)
                worksheet = writer.sheets[Sheet2]
                writer._save()
                #break
            else:
                writer = pd.ExcelWriter(filename_with_path_and_extn)
                prim_keys.to_excel(writer, sheet_name=file_suffix_no_key)
                worksheet = writer.sheets[file_suffix_no_key]
                writer._save()

            print("Elapsed: {} s".format(round(toc - tic,4)))


if __name__=="__main__":
    main()
