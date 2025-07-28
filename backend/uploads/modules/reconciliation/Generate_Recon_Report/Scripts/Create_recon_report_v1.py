from collections import OrderedDict as od
import pandas as pd
import glob, os
from Settings_Component_Recon import *

def diff_func(df_left, df_right, uid, labels, drop):
    dict_df = {labels[0]: df_left, labels[1]: df_right}
    col_left = df_left.columns.tolist()
    col_right = df_right.columns.tolist()

    # There could be columns known to be different, hence allow user to pass this as a list to be dropped.
    if drop[0] or drop[1]:
        print ('{}: Ignoring columns {} in comparison.'.format(labels[0], ', '.join(drop[0])))
        col_left = list(filter(lambda x: x not in drop[0], col_left))
        df_left = df_left[col_left]

    if drop[0] or drop[1]:
        print ('{}: Ignoring columns {} in comparison.'.format(labels[1], ', '.join(drop[1])))
        col_right = list(filter(lambda x: x not in drop[1], col_right))
        df_right = df_right[col_right]

    # Step 1 - Check if no. of columns are the same:
    len_lr = len(col_left), len(col_right)
    assert len_lr[0]==len_lr[1], \
    'Cannot compare frames with different number of columns: {}.'.format(len_lr)

    # Step 2a - Check if the set of column headers are the same
    #           (order doesnt matter)
    assert set(col_left)==set(col_right), \
    'Left column headers are different from right column headers.' \
       +'\n   Left orphans: {}'.format(list(set(col_left)-set(col_right))) \
       +'\n   Right orphans: {}'.format(list(set(col_right)-set(col_left)))

    # Step 2b - Check if the column headers are in the same order
    if col_left != col_right:
        print ('[Note] Reordering right Dataframe...')
        df_right = df_right[col_left]

    # Step 3 - Check datatype are the same [Order is important]
    if all(df_left.dtypes == df_right.dtypes):
        print ('DataType check: Passed')
    else:
        print ('dtypes are not the same.')
        df_dtypes = pd.DataFrame({labels[0]:df_left.dtypes,labels[1]:df_right.dtypes,'Diff':(df_left.dtypes == df_right.dtypes)})
        df_dtypes = df_dtypes[df_dtypes['Diff']==False][[labels[0],labels[1],'Diff']]
        print (df_dtypes)

    # Step 4 - Check for duplicate rows
    for key, df in dict_df.items():
        if df.shape[0] != df.drop_duplicates().shape[0]:
            print(key + ': Duplicates exists, they will be dropped.')
            dict_df[key] = df.drop_duplicates()

    # Step 5 - Check for duplicate uids.
    if isinstance(uid, (str, list)):
        print ('Uniqueness check: {}'.format(uid))
        for key, df in dict_df.items():
            count_uid = df.shape[0]
            count_uid_unique = df[uid].drop_duplicates().shape[0]
            dp = [0,1][count_uid_unique == df.shape[0]] #<-- Round off to the nearest integer if it is 100%
            pct = round(100*count_uid_unique/df.shape[0], dp)
            print ('{}: {} out of {} are unique ({}%).'.format(key, count_uid_unique, count_uid, pct))

    # Checks complete, begin merge. 
    d_result = od()
    d_result[labels[0]] = df_left
    d_result[labels[1]] = df_right
    if all(df_left.eq(df_right).all()):
        print('Trival case: DataFrames are an exact match.')
        d_result['Merge'] = df_left.copy()
    else:
        df_merge = pd.merge(df_left, df_right, on=col_left, how='inner')
        if not df_merge.shape[0]:
            print('Trival case: Merged DataFrame is empty')
        
        d_result['Merge'] = df_merge
        if type(uid)==str:
            uid = [uid]

        if type(uid)==list:
            #df_left_only = df_left.append(df_merge).reset_index(drop=True)
            df_left_only = pd.concat([df_left, df_merge]).reset_index(drop=True)
            df_left_only['Duplicated']=df_left_only.duplicated(keep=False)  #keep=False, marks all duplicates as True
            df_left_only = df_left_only[~df_left_only['Duplicated']]
            #df_right_only = df_right.append(df_merge).reset_index(drop=True)
            df_right_only = pd.concat([df_right, df_merge]).reset_index(drop=True)
            df_right_only['Duplicated']=df_right_only.duplicated(keep=False)
            df_right_only = df_right_only[~df_right_only['Duplicated']]

            label = '{} or {}'.format(*labels)
            df_lc = df_left_only.copy()
            df_lc[label] = labels[0]
            df_rc = df_right_only.copy()
            df_rc[label] = labels[1]
            #df_c = df_lc.append(df_rc).reset_index(drop=True)
            df_c = pd.concat([df_lc, df_rc]).reset_index(drop=True)
            df_c['Duplicated'] = df_c.duplicated(subset=uid, keep=False)
            df_c1 = df_c[df_c['Duplicated']]
            df_c1 = df_c1.drop('Duplicated', axis=1)
            cols = df_c1.columns.tolist()
            df_c1 = df_c1[[cols[-1]]+cols[:-1]]
            df_uc = df_c[~df_c['Duplicated']]

            df_uc_left = df_uc[df_uc[label]==labels[0]]
            df_uc_right = df_uc[df_uc[label]==labels[1]]

            d_result[labels[0]+'_only'] = df_uc_left.drop(['Duplicated', label], axis=1)
            d_result[labels[1]+'_only'] = df_uc_right.drop(['Duplicated', label], axis=1)
            d_result['Diff'] = df_c1.sort_values(uid).reset_index(drop=True)
    
    return d_result

def main():
    df_left_original = pd.read_csv(os.path.join(input_left))
    df_right_original = pd.read_csv(os.path.join(input_right))
    col_left_original = df_left_original.columns.tolist()
    col_right_original = df_right_original.columns.tolist()
    uid = uid_columns
    to_be_compared_when_value_of_uid_is_same = columns_to_be_compared_when_value_of_uid_is_same
    left_only_needed_with_original = left_only_needed_with_original_value
    right_only_needed_with_original = right_only_needed_with_original_value

    drop_left = list(set(col_left_original) - set(uid) - set(to_be_compared_when_value_of_uid_is_same))
    drop_right = list(set(col_right_original) - set(uid) - set(to_be_compared_when_value_of_uid_is_same))

    labels=('Left', 'Right')

    drop = [drop_left, drop_right]

    d_result = diff_func(df_left_original, df_right_original, uid, labels, drop)

    d_result['Left_only'].to_csv(Left_only_output_file, index=False)
    d_result['Right_only'].to_csv(Right_only_output_file, index=False)
    d_result['Diff'].to_csv(Diff_output_file, index=False)

    if drop[0] and left_only_needed_with_original:
        d_result['Left_only_with_original'] = df_left_original.merge(d_result['Left_only'][uid], how = 'inner', on = uid)
        d_result['Left_only_with_original'].to_csv(Left_only_output_file_with_original, index=False)
        
    
    if drop[1] and right_only_needed_with_original:
        d_result['Right_only_with_original'] = df_right_original.merge(d_result['Right_only'][uid], how = 'inner', on = uid)
        d_result['Right_only_with_original'].to_csv(Right_only_output_file_with_original, index=False)

if __name__ == "__main__":
    main()

    
    
    
