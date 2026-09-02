import { Text, View, type ViewProps } from "react-native";

import {
  BaseBlock,
  Block,
  END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE,
  EndOfBoreholeBlock,
} from '@mmsb/core';
import { styles } from "@/src/constants/styles";
import { getDateTime } from "@/src/utils/datetime";

export type EndOfBoreholeBlockProps = ViewProps & {
  block: BaseBlock & EndOfBoreholeBlock;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

export function EndOfBoreholeBlockComponent({ block, blocks, setBlocks, ...otherProps }: EndOfBoreholeBlockProps) {
  return (
    <>
      <View style={styles.blockComponentLeftColumn}>
        <Text>{block.topDepthInMetres.toFixed(3)}</Text>
        <View style={{ flex: 1, minHeight: 20 }}></View>
      </View>
      <View style={{ flex: 1, gap: 20 }}>
        {block.otherInstallations !== END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE && (
          <View>
            {(block.installationDate === null || block.installationTime === null) ? '' : <Text>Installation Date and Time: {getDateTime(block.installationDate, block.installationTime)}</Text>}
            {(block.waterLevelInMetres === null) ? '' : <Text>Water Level: {block.waterLevelInMetres}</Text>}
          </View>
        )}
        <Text>{block.description}</Text>
        {(block.remarks.length === 0) ? '' : <Text>Remarks: {block.remarks}.</Text>}
      </View>
    </>
  );
}