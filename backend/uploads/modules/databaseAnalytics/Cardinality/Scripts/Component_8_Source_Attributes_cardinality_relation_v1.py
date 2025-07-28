from itertools import product
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from Settings_Component_8 import *

def get_relation(df, col1, col2):
    first1=df[[col1, col2]]
    first = df[[col1, col2]].drop_duplicates().groupby(col1).count()
    second = df[[col2, col1]].drop_duplicates().groupby(col2).count()
    first_max = first.max()[0]
    second_max = second.max()[0]
    first_max_value = first[first[col2] == first_max].index.values
    second_max_value = second[second[col1] == second_max].index.values
    first_with_count1 = first[first[col2] == 1].count()[0]
    second_with_count1 = second[second[col1] == 1].count()[0]
    first_count = first.count()[0]
    second_count = second.count()[0]
    first_pct_calc = round((first_with_count1*100) /first_count,2)
    second_pct_calc = round((second_with_count1 * 100) / second_count,2)
    if first_max==1:
        if second_max==1:
            return '1-to-1', '100', '100', f'Each value of {col1} is tagged with only one value of {col2} and vice versa', f'There are {first_with_count1} values of {col1} tagged with 1-to-1 relationship to {second_with_count1} values of {col2}.'
        else:
            return 'many-to-1', '100', f'{second_pct_calc}', f'Many values of {col1} (max count of {second_max}) is tagged to only one value of {col2} ({second_max_value})', f'{second_pct_calc}% ({second_with_count1} out of {second_count}) of values of {col2} is having 1-to-1 relationship to {col1}.'
    else:
        if second_max==1:
            return '1-to-many', f'{first_pct_calc}', '100', f'There is at least one value of {col1} ({first_max_value}) tagged with many values of {col2} (max up to {first_max})', f'{first_pct_calc}% ({first_with_count1} out of {first_count}) of values of {col1} is having 1-to-1 relationship to {col2}.'
        else:
            return 'many-to-many', f'{first_pct_calc}', f'{second_pct_calc}', f'At least one value of {col1} ({first_max_value}) is tagged to {first_max} values of {col2}, and at least one value of {col2} ({second_max_value}) is tagged to {second_max} values of {col1}', f'{first_pct_calc}% ({first_with_count1} out of {first_count}) of values of {col1} is having 1-to-1 relationship to {col2}. ' \
                                                                                                                                                                                                                                    f'{second_pct_calc}% ({second_with_count1} out of {second_count}) of values of {col2} is having 1-to-1 relationship to {col1}.'
def report_relations(file):
    internal_column_rels = []
    df_input = pd.read_csv(file)

    for col_i, col_j in tqdm(product(df_input.columns, df_input.columns)):
        if col_i == col_j:
            continue
        relation = get_relation(df_input, col_i, col_j)
        internal_column_rels.append([col_i, col_j, *relation])
        internal_column_rels_df = pd.DataFrame(internal_column_rels, columns=[Column1, Column2, Column3, Column4, Column5, Column6, Column7])
    return internal_column_rels_df

def main():
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module
    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
    for filename in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename, 'r', encoding=encoding_var, errors=errors_var) as file:
            tic = time.time()
            filename_with_extn = os.path.basename(filename)
            filename = os.path.splitext(filename_with_extn)[0]
            print(f"The processing of file '{filename}' in progress")
            internal_column_rels = report_relations(file)
            toc = time.time()

            filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename + output_file_extn
            filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

            internal_column_rels.insert(0, Table_Name_var, filename)
            writer = pd.ExcelWriter(filename_with_path_and_extn)
            
            internal_column_rels.to_excel(writer, sheet_name=Sheet1)
            workbook = xlsxwriter.Workbook(filename_with_path_and_extn)
            workbook = writer.book
            worksheet = writer.sheets[Sheet1]
            writer._save()

            print("Elapsed: {} s".format(round(toc - tic, 4)))

if __name__ == "__main__":
    main()
