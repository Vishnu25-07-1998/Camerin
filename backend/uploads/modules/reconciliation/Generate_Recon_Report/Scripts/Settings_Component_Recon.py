#input left / dump 1 to be compared
input_left = r"C:\Users\Admin\Desktop\Camerin\backend\uploads\modules\reconciliation\Generate_Recon_Report\Left_Input\fielding_t20_data.csv"

#input right / dump 2 to be compared
input_right = r"C:\Users\Admin\Desktop\Camerin\backend\uploads\modules\reconciliation\Generate_Recon_Report\Right_Input\fielding_t20_data -right.csv"

#columns between two dumps to be matched
uid_columns = ['Player','Span','Mat']

#columns_to_be_compared_when_value_of_uid_is_same
columns_to_be_compared_when_value_of_uid_is_same = ['Player','Span','Mat','Inns','Dis']

#should the left original columns also be saved in csv output file along with left out output
left_only_needed_with_original_value = True

#should the right original columns also be saved in csv output file along with right out output
right_only_needed_with_original_value = True

#output file location and path
Left_only_output_file = 'C:/Users/Admin/Desktop/Camerin/backend/uploads/modules/reconciliation/Generate_Recon_Report/Outputs/Left_only.csv'
Right_only_output_file = 'C:/Users/Admin/Desktop/Camerin/backend/uploads/modules/reconciliation/Generate_Recon_Report/Outputs/Right_only.csv'
Diff_output_file = 'C:/Users/Admin/Desktop/Camerin/backend/uploads/modules/reconciliation/Generate_Recon_Report/Outputs/Diff.csv'
Left_only_output_file_with_original = 'C:/Users/Admin/Desktop/Camerin/backend/uploads/modules/reconciliation/Generate_Recon_Report/Outputs/Left_only_with_original.csv'
Right_only_output_file_with_original = 'C:/Users/Admin/Desktop/Camerin/backend/uploads/modules/reconciliation/Generate_Recon_Report/Outputs/Right_only_with_original.csv'