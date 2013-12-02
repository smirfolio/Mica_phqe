<?php

/**
 * @file
 * Hooks provided by the Node Reference module.
 */

/**
 * @addtogroup hooks
 * @{
 */

/**
 * Retrieves an array of candidate referenceable nodes for a given field.
 *
 * Useful when you need complex queries to retrieve candidate referenceable nodes.
 *
 * @param $field
 *   The field definition.
 * @param $options
 *   An array of options to limit the scope of the returned list. The following
 *   key/value pairs are accepted:
 *   - string: string to filter titles on (used by autocomplete).
 *   - match: operator to match the above string against, can be any of:
 *     'contains', 'equals', 'starts_with'. Defaults to 'contains'.
 *   - ids: array of specific node ids to lookup.
 *   - limit: maximum size of the the result set. Defaults to 0 (no limit).
 *
 * @return
 *   An array of valid nodes in the form:
 *   array(
 *     array(
 *       nid => array(
 *         'title' => The node title,
 *         'rendered' => The text to display in widgets (can be HTML)
 *       ),
 *       ...
 *     )
 *   }
 *   or FALSE if there is no candidates.
 */
function hook_node_reference_FIELD_potential_references($field, $options) {
  $query = db_select('node', 'n')
    ->addField('n', 'nid')
    ->addField('n', 'title', 'node_title')
    ->condition('n.type', $field['settings']['referenceable_types'], 'IN');
  $result = $query->execute()->fetchAll();
  $references = array();
  foreach ($result as $node) {
    $references[$node->nid] = array(
      'title'    => $node->node_title,
      'rendered' => check_plain($node->node_title),
    );
  }
  return array($references);
}