<?php

/**
 * @file
 * Taxonomy filter only allowing terms 
 */

$plugin = array(
  'form' => 'feeds_tamper_existing_terms_form',
  'callback' => 'feeds_tamper_existing_terms_callback',
  'name' => 'Only existing terms',
  'category' => 'Taxonomy',
  'single' => 'direct',
  'multi' => 'direct',
);

function feeds_tamper_existing_terms_form($importer, $element_key, $settings) {
  $form = array();
  $options = array();
  foreach (taxonomy_vocabulary_get_names() as $machine_name => $data) {
    $options[$machine_name] = $data->name;
  }
  $form['vocabulary'] = array(
    '#type' => 'select',
    '#title' => t('Vocabulary whose terms are allowed'),
    '#options' => $options,
    '#required' => TRUE,
    '#default_value' => isset($settings['vocabulary']) ? $settings['vocabulary'] : '',
  );
  return $form;
}

function feeds_tamper_existing_terms_callback($result, $item_key, $element_key, &$field, $settings) {
  static $allowed = array();
  if (!isset($allowed[$settings['vocabulary']])) {
    // fetch all term names in the configured vocabulary
    $allowed[$settings['vocabulary']] = db_query(
      'SELECT td.name 
        FROM {taxonomy_vocabulary} AS v 
        INNER JOIN {taxonomy_term_data} AS td ON td.vid = v.vid 
        WHERE v.machine_name = :machine_name
        GROUP BY td.name;',
      array(':machine_name' => $settings['vocabulary'])
    )->fetchCol('name');
  }
  if (is_array($field)) {
    $field = array_intersect($field, $allowed[$settings['vocabulary']]);
  } else {
    $field = in_array($field, $allowed[$settings['vocabulary']]) ? $field : '';
  }
}
