import { FileMenuItems, FilesSorting } from '../models';

export const FILE_MENU_ITEMS = [
  { label: FileMenuItems.Download },
  { label: FileMenuItems.Delete },
  { label: FileMenuItems.Embed },
  { label: FileMenuItems.Share },
  { label: FileMenuItems.Rename },
  { label: FileMenuItems.Move },
  { label: FileMenuItems.Copy },
];

export const FILE_SORT_OPTIONS = [
  {
    value: FilesSorting.NameAZ,
    label: 'Name: A-Z',
  },
  {
    value: FilesSorting.NameZA,
    label: 'Name: Z-A',
  },
  {
    value: FilesSorting.LastModifiedOldest,
    label: 'Last modified: oldest to newest',
  },
  {
    value: FilesSorting.LastModifiedNewest,
    label: 'Last modified: newest to oldest',
  },
];
