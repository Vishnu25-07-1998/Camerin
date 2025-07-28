#To be updated from UI after appropriate folder names are created based on the User's input details on the main folder, project and group names
folder_path_t = r'C:\Users\Admin\Desktop\Camerin\backend\uploads\modules\databaseAnalytics\Basic_Details\Inputs'
folder_path_t1 = "C:/Users/Admin/Desktop/Camerin/backend/uploads/modules/databaseAnalytics/Basic_Details/Inputs/"
folder_main_path = "C:\\Users\\Admin\\Desktop\\Camerin\\backend\\uploads\\modules"
project_name = "\\databaseAnalytics"
group_name = "\\Basic_Details"
group_name_for_filename = "Sample_1"
output_file_extn = ".csv"

#Usually, No need to update the below
folder_output_name_module = "\\Outputs"
folder_output_name_module_for_filename = ".Basic_Details."
Col1 = "Table_Name"
Col2 = "Column_Name"
Col3 = "Mandatory"
Col4 = "Percentage_of_not_null_values"
Col5 = "Data_Type_Python"
Col6 = "Min_Length"
Col7 = "Max_Length"
Col8 = "Scale"
Col9 = "Precision"
Col10 = "Sample_Value(s)"
Col11 = "Data_Type"
count = 0
zero_var = 0
float_var = 'float'
dat_var = 'dat'
per_var = 'per'
time_var = 'time'
nan_var = 'nan'
NA_var = '<NA>'
xlsx_var = '.xlsx'
csv_var = '.csv'
star_csv_var = '*.csv'
Int64_var = 'Int64'
object_var = 'object'
ms_var = 'ms'
Possibly_Time_var = 'Possibly_Time'
Source_Empty_var = 'Source_Empty'
Not_Applicable_var = 'Not_Applicable'
Default_Null_var = 'Default_Null'
flo_var = 'flo'
convert_datatype = {"obj":"Alphanumeric"
                   ,"int":"Integer"
                   ,"Int":"Integer"
                   ,"flo":"Float"
                   ,"dat":"Date"
                   ,"per":"Date"
                   ,"dattime":"Timestamp"
                   ,"pertime":"Timestamp"
                   ,"Possibly_Time":"Possibly_Time_Related"
                   ,"Not_Applicable":"Not_Applicable"
                    }

#exec(open(r'C:\Users\USER_ID\OneDrive - COMPANY_NAME Group\_MyHome\user\My Documents\Official\Manhattan\python\main\To_Be_Packaged\Apr_2023_1_Automated_Data_Analysis_v29.py').read(), globals())