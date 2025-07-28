import re
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from nltk.corpus import wordnet as wn
from collections import Counter
import nltk
from Settings_Component_5B import *

def get_synonyms(word, pos):
  ' Gets word synonyms for part of speech '
  for synset in wn.synsets(word, pos=pos_to_wordnet_pos(pos)):
    for lemma in synset.lemmas():
        yield lemma.name()

def pos_to_wordnet_pos(penntag, returnNone=False):
    'Mapping from POS tag word wordnet pos tag '
    morphy_tag = {'NN':wn.NOUN, 'JJ':wn.ADJ,
                  'VB':wn.VERB, 'RB':wn.ADV}
    try:
        return morphy_tag[penntag[:2]]
    except:
        return None if returnNone else ''

def main():
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module
    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module

    for filename_from in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename_from, read_var, encoding=encoding_var, errors=errors_var) as file_from:
        
            tic = time.time()
            filename_with_extn_from = os.path.basename(filename_from)
            filename_from = os.path.splitext(filename_with_extn_from)[0]
            filename_from_only = filename_from.split(split_var)[-1]
            print(f"Table '{filename_from}' Table_Name_as_is in progress")
            df_input_from = pd.read_csv(file_from, nrows=1)
            file_from_terms = re.findall(r'([a-zA-Z]+)',filename_from_only)
            table_name_details_row=[]
            file_from_terms_names = ''
            file_from_terms_names_set = set()
              
            for word in file_from_terms:
                word = word.lower()
                file_from_terms_names = file_from_terms_names + word + ' '
                file_from_terms_names_set.add(word)

            file_from_terms_names = file_from_terms_names.rstrip()
            text = nltk.word_tokenize(file_from_terms_names)
            term_count = zero_var

            for word, tag in nltk.pos_tag(text):
                unique = sorted(set(synonym for synonym in get_synonyms(word, tag) if synonym != word))
                term_count = term_count + 1
                
                file_from_table_name_meaning_set = set()
                for synonym in unique:
                    file_from_table_name_meaning_set.add(synonym)

                if len(file_from_table_name_meaning_set) == 0:
                    file_from_table_name_meaning_set = No_Meaning_available_var
                
                table_name_details_row.append([filename_from_only, file_from_terms_names_set, term_count, word, file_from_table_name_meaning_set])
            toc = time.time()
            print(elapsed_var.format(round(toc - tic, 4)))

    
        filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename_table + filename_from + output_file_extn        
        filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

        table_name_details_pd = pd.DataFrame(table_name_details_row,columns=[Col1, Col2, Col3, Col4, Col5])
        writer = pd.ExcelWriter(filename_with_path_and_extn)
        table_name_details_pd.to_excel(writer, sheet_name=sheet_name_table)
        worksheet = writer.sheets[sheet_name_table]
        workbook = xlsxwriter.Workbook()
        workbook = writer.book
        writer.save()

if __name__ == '__main__':
  main()
