/**
 * Legacy import surface kept stable while the command system now lives in the
 * dedicated registry module.
 */
export {
  commandDefinitions,
  commandDefinitionMap,
  commandGroupOrder,
  getCommandDefinition,
} from "./registry";
