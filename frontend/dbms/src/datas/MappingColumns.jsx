import { useMemo } from "react";

const MappingColumns = () =>
    useMemo(() => [
        { header: "ID", accessorKey: "id", hidden: false },
        { header: "Data Source Name", accessorKey: "datasource", editable: true, required: true },
        { header: "Source Entity", accessorKey: "sourceEntity", editable: true },
        { header: "Source Entity Alias Name", accessorKey: "sourceEntityAlias", editable: true },
        { header: "Source Attribute", accessorKey: "sourceAttribute", editable: true },
        { header: "Filter Transformation Condition Language", accessorKey: "filterTransformationConditionLanguage", editable: true },
        { header: "Filter Transformation Condition", accessorKey: "filterCondition", editable: true, multiLine: true },
        { header: "Transformation Rule Language", accessorKey: "transformationRuleLanguage", editable: true, required: true },
        { header: "Transformation Rule", accessorKey: "transformationRule", editable: true, multiLine: true, required: true },
        { header: "Target Attribute", accessorKey: "targetAttribute", editable: true },
        { header: "Part of Unique Key", accessorKey: "partOfUniqueKey", editable: true },
        { header: "Order by priority number", accessorKey: "orderByPriorityNumber", editable: true },
        { header: "Order By", accessorKey: "orderBy", editable: true },
        { header: "Data Type", accessorKey: "dataType", editable: true },
        { header: "Mandatory", accessorKey: "mandatory", editable: true },
        { header: "Min Length", accessorKey: "minLength", editable: true },
        { header: "Max Length", accessorKey: "maxLength", editable: true },
        { header: "Scale", accessorKey: "scale", editable: true },
        { header: "Precision", accessorKey: "precision", editable: true },
        { header: "Format", accessorKey: "format", editable: true },
    ], []);

export default MappingColumns;