// import { useState, useEffect } from "react";
// import type { Lead } from "../types";
// import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
// import { LEAD_STAGES } from "../constants";

// export default function EditLeadModal({
//   open,
//   onClose,
//   onSubmit,
//   lead,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (data: any) => void;
//   lead: Lead | null;
// }) {
//   if (!open || !lead) return null;

//   const [form, setForm] = useState(lead);

//   useEffect(() => {
//     if (lead) setForm(lead);
//   }, [lead]);

//   const update = (key: string, value: any) => {
//     setForm({ ...form, [key]: value });
//   };

//   // 👇 Form config WITH placeholders
//   const fields: FieldConfig[] = [
//     {
//       name: "lead_name",
//       label: "Lead Name",
//       type: "text",
//       placeholder: "Enter lead name",
//     },
//     {
//       name: "email",
//       label: "Email",
//       type: "email",
//       placeholder: "Enter email address",
//     },
//     {
//       name: "phone",
//       label: "Phone",
//       type: "number",
//       placeholder: "Enter phone number",
//     },
//     {
//       name: "company",
//       label: "Company",
//       type: "text",
//       placeholder: "Enter company name",
//     },
//     {
//       name: "stage",
//       label: "stage",
//       type: "select",
//       placeholder: "Select stage",
//       options: LEAD_STAGES,
//     },
//   ];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
//       <div className="bg-white w-[450px] max-h-[80vh] rounded-lg shadow-lg flex flex-col">

//         {/* Header */}
//         <div className="p-5 border-b">
//           <h2 className="text-xl font-semibold">Edit Lead</h2>
//         </div>

//         {/* Dynamic Form */}
//         <DynamicForm fields={fields} form={form} onChange={update} />

//         {/* Footer */}
//         <div className="p-4 border-t flex justify-end gap-2">
//           <button
//             className="px-4 py-2 rounded-lg hover:bg-gray-100 text-sm"
//             onClick={onClose}
//           >
//             Cancel
//           </button>

//           <button
//             className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
//             onClick={() => onSubmit(form)}
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
