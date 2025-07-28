#To be updated from UI after appropriate folder names are created based on the User's input details on the main folder, project and group names
folder_main_path = "C:\\Users\\Admin\\Desktop\\Camerin\\backend\\uploads\\modules"
project_name = "\\databaseAnalytics"
group_name = "\\Cardinality"
group_name_for_filename = "Sample_1"

#Usually, No need to update the below
output_file_extn = ".xlsx" #The csv option in the main code is not currently available. Once code change happens for the same, can be moved to the upper section so that user can choose.
folder_input_name_module = "\\Inputs\\"
folder_output_name_module = "\\Outputs"
folder_input_name_module_for_filename = ".Source_Dumps"
folder_output_name_module_for_filename_table = ".Table_Names_as_is_Meaning."
sheet_name_table = "Table_Names_as_is_Meaning"
elapsed_var = "Elapsed: {} s"

#The below find_all_var variable is overriden inside the main code
find_all_var = "r'([a-zA-Z]+)'"
split_var = '.'
read_var = 'r'
errors_var = 'ignore'
star_csv_var = '*.csv'
encoding_var = 'utf-8'
No_Meaning_available_var = 'No Meaning available'
zero_var = 0
Col1 = 'Table_Name'
Col2 = 'Table_Name_Terms_Separated'
Col3 = 'Term_Number'
Col4 = 'Term_Name'
Col5 = 'Term_Name_Meaning'

#exec(open(r'C:\Users\USER_ID\OneDrive - COMPANY_NAME Group\_MyHome\user\My Documents\Official\Manhattan\python\main\To_Be_Packaged\Apr_2023_5B_Source_Name_extract_meanings_v6.py').read(), globals())
