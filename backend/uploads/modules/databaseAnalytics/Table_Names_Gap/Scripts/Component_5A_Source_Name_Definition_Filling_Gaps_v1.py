import re
import pandas as pd
from tqdm import tqdm
import glob, os
import codecs
import time
import xlsxwriter
from collections import Counter
import nltk
from Settings_Component_5A import *

nltk.download()

def words(text): return re.findall(r'\w+', text.lower())

WORDS = set(w.lower() for w in nltk.corpus.words.words())

class Suggestor:
    def __init__(self,max_times,letters,raw_word_first_letter):
        self.max_times = max_times
        self.letters = letters

    def candidates(self,word):
        return self.known(self.edited_word(word))

    def known(self,words):
        return set(raw_word_first_letter + w for w in words if raw_word_first_letter + w in WORDS)

    def edit(self,word):
        letters = self.letters
        splits = [(word[:i], word[i:]) for i in range(len(word) + 2)]
        inserts = [L + c + R for L, R in splits for c in letters]
        return list(set(inserts))

    def edited_word(self,raw_word):
        raw_word = raw_word[1:]
        words = [[raw_word]]

        for i in range(self.max_times):
            i_times_words = []
            for word in words[-1]:
                i_times_words += self.edit(word)
            words.append(list(set(i_times_words)))
        return [w for word in words for w in word]

def main():
    folder_path_for_final_output = folder_main_path + project_name + group_name + folder_output_name_module
    folder_path_for_input = folder_main_path + project_name + group_name + folder_input_name_module

    for filename_from in tqdm(glob.glob(os.path.join(folder_path_for_input, star_csv_var))):
        with codecs.open(filename_from, 'r', encoding=encoding_var, errors=errors_var) as file_from:
        
            tic = time.time()
            filename_with_extn_from = os.path.basename(filename_from)
            filename_from = os.path.splitext(filename_with_extn_from)[0]
            filename_from_only = filename_from.split(split_var)[-1]
            print(f"Table '{filename_from}' extraction based on gaps filled in progress")
            df_input_from = pd.read_csv(file_from, nrows=1)
            file_from_terms = filename_from_only.split("_")
            table_relation_details_row=[]
            file_from_terms_names_set = set()
            
            file_from_terms_names = set()
            term_count = zero_var
            for word in file_from_terms:
                file_from_terms_names_set.add(word)
                remove_digits = str.maketrans('','',digits_list_var)
                word = word.translate(remove_digits).lower()
                
                file_from_terms_names.add(word)
                raw_word_first_letter = word[:1]
                suggestor = Suggestor(max_times=int(len(word)/max_times_divisor)+max_times_add,letters=vowels_list_var,raw_word_first_letter = raw_word_first_letter)
                file_from_table_name_vowels_corrected_set = (suggestor.candidates(word))
                term_count = term_count + 1

                if len(file_from_table_name_vowels_corrected_set) == 0:
                    file_from_table_name_vowels_corrected_set = ''
                    
                table_relation_details_row.append([filename_from_only, file_from_terms_names_set, term_count, word, file_from_table_name_vowels_corrected_set])
                
                toc = time.time()
                print(elapsed_var.format(round(toc - tic, 4)))

                filename_with_extn = group_name_for_filename + folder_output_name_module_for_filename + filename_from + output_file_extn
                filename_with_path_and_extn = os.path.join(folder_path_for_final_output,filename_with_extn)

            #table_relation_details_pd = pd.DataFrame(table_relation_details_row,columns=['Table_Name_From', 'Table_Name_Gap_filled_set'])
            table_relation_details_pd = pd.DataFrame(table_relation_details_row,columns=[Col1, Col2, Col3, Col4, Col5])
            writer = pd.ExcelWriter(filename_with_path_and_extn)
            table_relation_details_pd.to_excel(writer, sheet_name=sheet_name_table)
            worksheet = writer.sheets[sheet_name_table]
            workbook = xlsxwriter.Workbook()
            workbook = writer.book
            writer.save()

if __name__ == '__main__':
    main()   
